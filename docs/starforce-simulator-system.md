# 스타포스 시뮬레이터 작동 방식 (코드 기준)

이 문서는 `sim/starforce` 페이지가 실제로 어떤 규칙으로 시뮬레이션을 수행하는지, 현재 코드 구현을 기준으로 정리한 문서입니다.

- 분석 기준: `/src/app/(starforce-simulator)/sim/starforce`, `/src/entities/starforce`
- 참고: UI 문구에 `로직 업데이트: 2025.07.10` 표시
- 주의: 아래 내용은 "게임 일반 상식"이 아니라 "현재 저장소 코드"의 동작을 설명합니다.

## 1) 전체 구조

### 페이지/상태/워커 구성

- 페이지 엔트리: `src/app/(starforce-simulator)/sim/starforce/page.tsx`
- 상태/입력 검증(atom): `src/app/(starforce-simulator)/sim/starforce/_lib/molecule.ts`
- 계산 시작/워커 병렬화: `src/app/(starforce-simulator)/sim/starforce/_components/CalculateButtons.tsx`
- 실제 몬테카를로 루프: `src/app/(starforce-simulator)/sim/starforce/_lib/workers/simulateStarforce.ts`
- 확률/비용 도메인 로직: `src/entities/starforce/constants.ts`, `src/entities/starforce/utils.ts`

실행 흐름은 다음과 같습니다.

1. 사용자가 입력값/옵션 설정
2. `inputsAtom`에서 유효성 검증 통과 시 계산 버튼 활성화
3. 계산 시작 시 Web Worker 여러 개 생성
4. 각 Worker가 독립적으로 시뮬레이션 수행 후 `costs`, `destroyedCounts` 반환
5. 메인 스레드가 모든 결과를 합쳐 정렬
6. 차트/평균/상위 퍼센트 UI 렌더링

## 2) 입력값과 검증 규칙

검증은 `molecule.ts`의 zod 스키마로 수행됩니다.

- 장비 레벨(`level`)
1. 정수
2. 0 이상 300 이하

- 스페어 비용(`spareCost`)
1. 숫자
2. 빈칸 허용(빈칸은 0으로 처리)

- 현재 스타포스(`currentStar`)
1. 정수
2. 0 이상
3. 최대값은 장비 레벨별 도달 가능 스타 - 1
4. 빈칸이면 0으로 처리

- 목표 스타포스(`targetStar`)
1. 필수
2. 정수
3. 현재 스타포스 + 1 이상
4. 장비 레벨별 도달 가능 스타 이하

- 시뮬레이션 횟수(`simulationCount`)
1. 필수
2. 정수
3. 2 이상 100000 이하

### 확정 복구 섹션 활성화 조건

세부 설정의 `확정 복구` 섹션은 아래 조건을 만족할 때만 활성화됩니다.

1. `level`이 `Starforce.restoreAvailableLevels`에 포함됨  
2. `targetStar`가 16 이상  
   (`restoreAvailableStars = restoreAvailableStar.filter((star) => star < targetStar)` 이므로, 최소 15성이 포함되어야 활성화)

비활성 상태에서는 버튼 입력이 막히며 안내 문구가 표시됩니다.

### 레벨별 도달 가능 스타

`Starforce.getReachableStar(level)`:

- `level < 95` => 5성
- `95 <= level <= 107` => 10성
- `108 <= level <= 127` => 15성
- `128 <= level <= 137` => 20성
- `level >= 138` => 30성

## 3) 확률 테이블과 옵션 적용 순서

기본 확률 테이블(`starforceProbTable`)은 0~29성에 대해 다음 3개 값으로 구성됩니다.

- 인덱스 0: 성공 확률
- 인덱스 1: 유지 확률
- 인덱스 2: 파괴 확률

구현 주석도 `[success, maintain, destroy]` 형태를 사용합니다.

### 원본 확률표 요약 (0~29성)

아래는 `constants.ts`의 원본 확률표를 구간 중심으로 요약한 값입니다.

- 0성: `0.95 / 0.05 / 0`
- 1성: `0.9 / 0.1 / 0`
- 2~3성: `0.85 / 0.15 / 0`
- 4성: `0.8 / 0.2 / 0`
- 5성: `0.75 / 0.25 / 0`
- 6성: `0.7 / 0.3 / 0`
- 7성: `0.65 / 0.35 / 0`
- 8성: `0.6 / 0.4 / 0`
- 9성: `0.55 / 0.45 / 0`
- 10성: `0.5 / 0.5 / 0`
- 11성: `0.45 / 0.55 / 0`
- 12성: `0.4 / 0.6 / 0`
- 13성: `0.35 / 0.65 / 0`
- 14성: `0.3 / 0.7 / 0`
- 15~16성: `0.3 / 0.679 / 0.021`
- 17~18성: `0.15 / 0.782 / 0.068`
- 19성: `0.15 / 0.765 / 0.085`
- 20성: `0.3 / 0.595 / 0.105`
- 21성: `0.15 / 0.7225 / 0.1275`
- 22성: `0.15 / 0.68 / 0.17`
- 23~25성: `0.1 / 0.72 / 0.18`
- 26성: `0.07 / 0.744 / 0.186`
- 27성: `0.05 / 0.76 / 0.19`
- 28성: `0.03 / 0.776 / 0.194`
- 29성: `0.01 / 0.792 / 0.198`

### 옵션 적용 순서 (`getProbTable`)

확률 계산은 아래 순서로 진행됩니다.

1. 이벤트 적용
2. 스타캐치용 테이블 계산
3. 각 성수별로 스타캐치 ON/OFF 반영
4. 각 성수별 파괴방지 ON/OFF 반영

#### 3-1) 이벤트 적용

`event`가 아래 중 하나면 0~21성의 파괴확률을 30% 감소시킵니다.

- `21성 이하 파괴 확률 30% 감소`
- `샤타포스`
- `샤타포스(+흔적 복구 비용 20% 할인)`
- `샤타포스(15 16 포함)`

적용식:

- `destroy = destroy * 0.7`
- `maintain = maintain + destroy_old * 0.3`

`event`가 아래 중 하나면 5,10,15성을 확정 성공으로 만듭니다.

- `5/10/15성 100%`
- `샤타포스(15 16 포함)`

적용식(해당 성수만):

- `success = 1`
- `maintain = 0`
- `destroy = 0`

#### 3-2) 스타캐치 적용

스타캐치가 켜진 성수는 아래 공식으로 확률을 재계산합니다.

- `success' = success * 1.05`
- `maintain' = ((1 - success') * maintain) / (1 - success)`
- `destroy' = ((1 - success') * destroy) / (1 - success)`

즉, 성공 확률을 5% 상대 증가시키고, 남은 실패 구간에서 유지/파괴 비율을 재분배합니다.

#### 3-3) 파괴방지 적용

파괴방지가 켜진 성수는 파괴 확률을 0으로 만들고 그만큼 유지로 옮깁니다.

- `maintain = maintain + destroy`
- `destroy = 0`

UI에서 파괴방지 토글은 15/16/17성만 제공됩니다.

## 4) 강화 비용 계산

### 4-1) 기본 강화비 (`getCosts(level)`)

각 성수(0~29)에 대해 기본 비용 배열을 생성합니다.

#### 0~9성

`round((1000 + level^3 * (star + 1) / 36) / 100) * 100`

#### 10성 이상

1. `base = level^3 * (star + 1)^2.7`
2. 성수별 분모로 나눠 반올림 후 100메소 단위 처리
3. 최종식: `1000 + round((base / divisor) / 100) * 100`

분모(`divisor`)는 다음과 같습니다.

- 10성: 571
- 11성: 314
- 12성: 214
- 13성: 157
- 14성: 107
- 17성: 150
- 18성: 70
- 19성: 45
- 21성: 125
- 그 외(15,16,20,22~29): 200

### 4-2) 할인 적용 순서 (워커 내부)

워커에서 실제 시도 비용 배열(`discountedCosts`)을 만들 때:

1. 사용자 할인(`MVP`, `PC Room`)을 0~16성에만 적용
2. 이벤트가 아래 중 하나면 전 성수에 추가로 30% 할인 적용
   - `30% 할인`
   - `샤타포스`
   - `샤타포스(+흔적 복구 비용 20% 할인)`
   - `샤타포스(15 16 포함)`
3. 각 성수 비용을 `Math.round` 처리

사용자 할인율 합산은 단순 합(`getDiscountRatio`)입니다.

- MVP Silver: 3%
- MVP Gold: 5%
- MVP Diamond: 10%
- PC Room: 5%

UI 로직상 MVP 계열은 동시에 여러 개 선택되지 않게 처리됩니다(마지막 선택 1개만 유지).

### 4-3) 파괴방지 추가 비용

각 강화 시도 1회 비용은 아래 식입니다.

`시도비용 = discountedCosts[현재성] + 파방추가비용`

`파방추가비용`은 아래 조건에서만 붙습니다.

- 해당 성수에 파괴방지 ON
- 현재 성수가 확정성공(`success === 1`)이 아님

추가비용 값:

- `defaultCosts[현재성] * 2`

즉, 파방 추가비용은 할인 후 비용이 아니라 "기본 비용" 기준입니다.

### 4-4) 확정 복구 비용

파괴 발생 시 아래 조건을 모두 만족하면 확정 복구를 시도합니다.

- 해당 성수에 확정 복구 ON (`restoreRecord[현재성] === true`)
- 장비 레벨이 복구 가능 레벨 (`isRestoreAvailableLevel(level)`)
- 현재 성수가 복구 가능 성수 (`isStarforceRestoreAvailableStar(현재성)`)

복구 리소스는 `restoreResourceTable[level][star]`에서 조회합니다.

- `requiredSpareCount`: 필요한 스페어 개수
- `restoreCostInHundredMillions`: 복구 비용(억 메소 단위)

적용 비용식:

- `restoreCostMeso = round(restoreCostInHundredMillions * 100_000_000)`
- `restoreMesoDiscountRatio = (event가 '흔적 복구 비용 20% 할인' 또는 '샤타포스(+흔적 복구 비용 20% 할인)'이면 0.2, 아니면 0)`
- `discountedRestoreCostMeso = round(restoreCostMeso * (1 - restoreMesoDiscountRatio))`
- `총 복구비용 = spareCost * requiredSpareCount + discountedRestoreCostMeso`

주의:

- 복구 비용 할인 이벤트는 스페어 비용(`spareCost * requiredSpareCount`)에는 적용되지 않습니다.
- 오직 순수 메소 복구비(`restoreCostMeso`)에만 20% 할인이 적용됩니다.

복구 리소스가 `0, 0`인 경우(예: 일부 레벨의 20~22성)는 확정 복구를 적용하지 않고 일반 파괴 처리로 진행합니다.

## 5) 1회 시뮬레이션 루프 동작

워커는 각 trial(1회 완주 시뮬레이션)마다 아래 상태로 시작합니다.

- `star = currentStar`
- `spentCost = 0`
- `destroyedCount = 0`

`star >= targetStar`가 될 때까지 루프를 반복합니다.

### 단계별 처리

1. 현재 성수의 확률 행 조회
2. 해당 시도의 비용 누적
3. 결과 판정

결과 판정 규칙:

- 확정성공(`success === 1`)이면 랜덤 없이 `star += 1`
- 아니면 `Math.random()`으로 성공/유지/파괴 선택

분기 처리:

- 성공
1. 기본: `star += 1`
2. 이벤트가 `10성 이하 1+1`이고 현재 성수가 10 이하이면 추가 +1
3. 즉 해당 조건이면 한 번에 +2성

- 유지
1. 성수 변화 없음

- 파괴
1. `destroyedAtStar = star` 저장
2. 확정 복구 조건 검사 (`restoreRecord`, 복구 가능 레벨/성수)
3. 확정 복구 가능 + 리소스가 유효(`requiredSpareCount > 0 && restoreCostMeso > 0`)하면:
   - `spentCost += spareCost * requiredSpareCount + restoreCostMeso`
   - `star = destroyedAtStar` (파괴 직전 성수로 복귀)
4. 그 외에는 일반 파괴 처리:
   - `star = 12`
   - `spentCost += spareCost`
5. `destroyedCount += 1` (복구 여부와 관계없이 파괴 횟수는 증가)

목표 달성 시(`star >= targetStar`) 결과 배열에 저장:

- `costs.push(spentCost)`
- `destroyedCounts.push(destroyedCount)`

## 6) 워커 병렬화와 진행률

### 병렬 워커 수

- `maxWorkerCount = max(1, floor(hardwareConcurrency * 0.5))`
- 실제 생성 수: `min(maxWorkerCount, simulationTotalCount)`

### 작업 분할

- 전체 set 개수: `simulationSetCount = min(100, simulationTotalCount)`
- set당 trial 수: `simulationUnitCount = floor(total / setCount)`
- worker당 set 배분 후, 마지막 worker가 나머지 담당

### 진행률

워커는 set 하나를 끝낼 때마다 `type: "calculating"` 메시지를 보냅니다.

메인 스레드는 이를 받을 때마다 진행률을 증가시킵니다.

- `progressUnit = round2(100 / simulationSetCount)`
- `progress = min(100, progress + progressUnit)`

모든 워커가 `done`을 보내면:

1. 비용 배열 정렬
2. 파괴횟수 배열 정렬
3. atom 상태에 저장
4. 계산 상태 종료

## 7) 결과 표시/통계 계산

### 7-1) 결과 데이터

최종적으로 두 배열을 사용합니다.

- `costs`: 각 trial의 총 소모 메소
- `destroyedCounts`: 각 trial의 총 파괴 횟수

두 배열 모두 오름차순 정렬된 상태로 저장됩니다.

### 7-2) 차트(`ResultChart`)

차트는 히스토그램 + 누적분포(CDF)로 그려집니다.

- 데이터가 모두 같은 값이면 전체 사용
- 값이 다양하면 상위 꼬리 0.1%를 잘라서 표시
  - `rawData.slice(0, round(N * 0.999))`

주의할 점:

- 차트는 시각화를 위해 일부 절삭될 수 있음
- 그러나 평균/상위 N% 계산은 전체 데이터(`rawData`) 기준

### 7-3) 평균/상위 N%(`TopPercent`)

`TopPctCost(type: "data")`를 사용해 계산합니다.

- 평균(`meanCost`) = 샘플 산술평균
- `상위 x% -> 값` 변환:
  - 인덱스 `floor((x / 100) * length) - 1`의 값
- `값 -> 상위 x%` 변환:
  - `샘플 <= 값`인 비율(% )

## 8) 복구 관련 상수 사용처

`src/entities/starforce/constants.ts`에는 아래 데이터도 함께 정의되어 있습니다.

- `restoreAvailableLevels`
- `restoreAvailableStar`
- `restoreResourceTable`

현재 코드에서 이 상수들은 실제로 사용됩니다.

1. `molecule.ts`
   - 복구 섹션 활성화 조건 계산 (`restoreAvailableStarsAtom`, `isRestoreEnabledAtom`)
2. `simulateStarforce.ts`
   - 파괴 시 확정 복구 비용 계산 및 성수 복귀 처리

## 9) 구현상 주의사항 (코드 해석 포인트)

아래는 문서화 시 꼭 알고 있어야 하는 구현 디테일입니다.

1. `getProbTable`은 `starforceProbTable` 원본 배열을 직접 수정하는 방식으로 이벤트를 반영합니다.
2. 스타캐치 성공 확률은 `*1.05` 후 상한(1.0) 캡을 따로 두지 않습니다.
3. 유지 분기에서 성수 하락 처리가 없습니다(유지 시 성수 변화 없음).
4. 파괴 발생 시 확정 복구 조건을 만족하면 복구 비용을 추가로 지불하고 파괴 직전 성수로 돌아갑니다(아니면 12성으로 하락).
5. 파괴방지 UI 토글은 15/16/17성만 제공됩니다.
6. 확정 복구 UI 토글은 15~22성 버튼을 제공하고, 섹션 자체는 레벨/목표성 조건을 만족할 때만 활성화됩니다.
7. 할인 UI는 MVP 계열 1개 + PC Room 조합 형태가 되도록 제어됩니다.

---

필요하면 다음 단계로, 이 문서를 기반으로 "실제 메이플 공식 규칙 대비 구현 차이" 비교 문서(검증 체크리스트)도 이어서 만들 수 있습니다.
