# 짭불춤 — 얼음과 불의 춤 (ADOFAI Web Edition)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yjchoi101222/Jjab-Bul_Choom)

브라우저에서 바로 플레이할 수 있는 웹 기반 **얼음과 불의 춤 (A Dance of Fire and Ice)** 리듬 게임입니다.

## 주요 기능
- **원작 `.adofai` / `.zip` 맵 실행**: 커스텀 맵 압축 파일(`.zip`) 또는 `.adofai` 파일을 드래그 앤 드롭하거나 설정(`⚙️ 설정`) → `[📂 맵 파일 열기]`로 즉시 플레이
- **원작 카메라 & VFX 엔진**: `MoveCamera`, `MoveTrack`, `AnimateTrack`, `SetFilter` (13종 화면 필터 & 블룸), `RecolorTrack` (네온/글로우/펄스), `CustomBackground`, `Flash`, `ShakeScreen`, 배속 타일(`x2`, `x1/2` 등) 지원
- **Jipper's Keys Visualizer & 사용자 지정 키 제한 연동**:
  - 다크 아크릴 + 불/얼음 네온 글로우 + 상승 라이트 레일(`Key Ripple`) 및 실시간 KPS / TOTAL 카운터
  - 키뷰어 슬롯 클릭 리바인딩 또는 키 제한 설정 시 입력 허용 키(`allowedKeys`) 실시간 자동 연동
- **하단 판정선 (Hit Error Meter) & 상세 결과창**:
  - `Timing Scale`, 3초 유지 타격 오차 눈금, 9단계 누적 카운터
  - 완주/실패 시 등급(`PP`/`X+`/`S+`~`F`), `X-Acc`, 평균 오차·UR, 오차 분포 히스토그램 & 산점도, `[🎯 실패 직전 구간 연습]` 지원
- **구간 연습 모드**: 하단 프로그레스 바 클릭/드래그 및 `←` / `→` 화살표 키로 원하는 타일로 이동 후 `Space`로 즉시 연습 시작

## Render.com 원클릭 배포 방법
1. 이 저장소(`https://github.com/yjchoi101222/Jjab-Bul_Choom`)에 프로젝트 파일들을 푸시(또는 업로드)합니다.
2. 아래 원클릭 배포 링크를 클릭하거나 [Render 대시보드](https://dashboard.render.com/)에서 연결합니다:
   - **원클릭 배포 링크**: https://render.com/deploy?repo=https://github.com/yjchoi101222/Jjab-Bul_Choom
3. 수동으로 **New + → Static Site**에서 연결할 경우:
   - **Repository**: `https://github.com/yjchoi101222/Jjab-Bul_Choom`
   - **Build Command**: *(비워둠)*
   - **Publish Directory**: `.`
