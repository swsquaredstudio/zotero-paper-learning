# Ivar Paper Learning Export 0.2.2

**베타 버전입니다.** Zotero 10.0.x용 로컬 논문 학습 패키지 내보내기 확장입니다. **이번 0.2.2의 실제 Zotero 기동·내보내기는 아직 검증 전입니다.** 자동 테스트와 파일/ZIP 검증 결과는 아래에 구분했습니다.

## 사용
1. Zotero 도구 → 플러그인 → 파일에서 플러그인 설치에서 `ivar-paper-learning-0.2.2.xpi`를 선택하십시오. 같은 플러그인의 새 버전입니다. 이번 제작 과정에서는 설치하지 않았습니다.
2. 라이브러리에서 논문, 연결된 PDF 또는 노트 하나를 선택하고 도구 → **Open Learning Note…**를 누르십시오.
3. 첫 영역에서 기존 노트를 직접 선택하고 **Open selected note**를 누르십시오. 새 노트가 필요할 때만 두 번째 **Create a separate new note…** 영역을 펼치고 유형·범위를 정한 뒤 **Create separate note and open**을 누르십시오. 새 노트 옵션은 위에서 선택한 기존 노트에 적용되지 않습니다. 새 노트는 논문 아래 생성되며 기존 노트를 덮어쓰지 않습니다.
4. Zotero 기본 노트 창에서 계속 작성하십시오. 입력 내용은 Zotero의 기본 저장·동기화 설정을 따릅니다. 플러그인 삭제 후에도 일반 노트로 남습니다.
5. 내보낼 때 **Export Paper Learning Package…**를 누르고 포함할 노트를 체크하십시오. 플러그인이 만든 `ivar-learning` 태그 노트만 기본 선택되고 다른 메모는 자동 포함하지 않습니다.
6. PDF·주석 수·노트 목록을 확인하고 저장 폴더를 고르면 ZIP이 생성됩니다. 마지막 저장 폴더를 기억합니다. 취소해도 Zotero 노트는 지워지지 않습니다.
7. 완료 메시지 뒤 **Open the export folder?**에서 폴더를 열 수 있습니다.

```
paper-learning-<PDF키>-<시각>/
  paper-learning.zip       ← 이것 하나를 첨부하십시오
  files/
    paper.pdf             ← 원문 복사본
    learning.md            ← 선택한 노트, 주석, 검토 지침
    annotations.json      ← 선택 노트의 원래 HTML·키·수정시각 및 주석
```

ZIP 내부에는 세 파일이 직접 들어갑니다. ZIP은 내보낸 시점의 스냅샷입니다. 이후 노트 수정은 기존 ZIP에 반영되지 않으므로 다시 내보내십시오.

PDF가 로컬에 없어도 학습 노트는 만들고 작성할 수 있습니다. 다만 PDF 포함 내보내기는 원문이 있어야 합니다. 학습 노트를 논문에 연결할 수 없는 독립 PDF는 먼저 Zotero에서 상위 서지 항목을 만들어 주십시오. 독립 PDF의 주석·원문 내보내기는 가능합니다.

이전 버전의 `learning.md` 안에만 있는 해석은 자동으로 가져오지 않습니다. 필요한 내용을 새 Zotero 학습 노트에 붙여 넣으십시오. 기존 ZIP·Markdown·노트는 삭제하거나 덮어쓰지 않습니다.

## 색상과 학습
- 빨강 `#ff6666`: 모르는 단어·숙어
- 노랑 `#ffd400`: 해석이 어려운 문장
- 파랑 `#2ea8e5`: 개념 질문
- 초록 `#5fb236`: 핵심 주장·근거
- 다른 색상도 ‘기타’로 보존합니다. 부분적으로 러프하게 표시하셔도 됩니다.

색상은 질문 유형입니다. `anki`, `해결완료` 같은 태그는 복습 상태를 표시합니다. 무조건 모든 문장을 하이라이트할 필요는 없습니다. 요약의 의도적인 생략과 번역 오류를 구분하는 검토 지침을 출력에 포함했습니다.

짧은 논문은 전체 요약, 긴 논문은 섹션별 해석을 작성하십시오. 노트 생성 시 섹션 표시는 작성 범위일 뿐이며, 주석을 자동 필터링하지 않습니다. 여러 섹션의 노트를 함께 선택할 수 있습니다. 교정이 끝난 뒤 가치 있는 항목만 Anki 후보로 선택하십시오. 자동 Anki 등록·AI 호출은 없습니다.

## 원본과 개인정보
- 원문 PDF는 로컬 파일을 그대로 복사합니다. Zotero 원본 파일·주석·데이터베이스를 변경하지 않습니다.
- Zotero의 DB 주석을 복사 PDF에 새로 새기지는 않습니다. 주석 정보는 Markdown/JSON에 별도 포함됩니다. 원본 PDF에 이미 들어 있던 내용은 그대로입니다.
- PDF가 로컬에 없으면 내보내기를 중단하고 안내합니다. 자동 다운로드나 웹 요청은 하지 않습니다. Zotero에서 파일을 내려받거나 연결을 복구한 후 다시 시도하십시오.
- PDF·주석·요약은 출력 폴더와 ZIP에 평문으로 들어갑니다. 전달 전에 비공개 내용이 있는지 확인하십시오. 클라우드 동기화 폴더에 저장하면 그 서비스의 기존 동기화 설정이 적용됩니다.
- 전체 로컬 PDF 경로는 JSON에 넣지 않습니다. 원본 파일명, 복사 파일명, 크기, 논문/PDF/주석 키, 라이브러리 ID, 로컬 Zotero 링크는 포함됩니다.
- PDF가 크면 ZIP도 클 수 있습니다. 사용하는 채팅 화면의 첨부 제한을 확인하십시오. PDF를 손실 압축하지 않습니다.

## 실패 처리와 한계
- 매번 새 폴더를 만들며 기존 경로는 덮어쓰지 않습니다. 같은 경로가 이미 있으면 중단합니다.
- 복사·파일쓰기·압축·ZIP 검사에 실패하면 성공 메시지를 내지 않고 부분 파일이 남은 위치를 안내합니다. 원본을 삭제하거나 수정하지 않습니다.
- 생성한 ZIP에 세 파일이 있는지와 CRC를 검사합니다. ZIP 밖의 files 폴더도 보존합니다.
- PDF 본문 추출·OCR·자동 문단 정렬·섹션 탐지·추천 API는 없습니다.
- 이미지/잉크 주석의 별도 이미지 파일은 넣지 않습니다. JSON 좌표와 포함된 원문 PDF를 참고하십시오.
- 로컬 Zotero 링크는 다른 라이브러리에서는 열리지 않을 수 있으며 AI에게 접근 권한을 주지 않습니다.
- 작성은 Zotero 기본 노트 편집기에서 합니다. 플러그인은 기존 노트 본문을 자동 수정하지 않습니다. 내보내기 직전에 선택 노트의 열린 편집기 저장을 요청하고 저장 트랜잭션 뒤에 내용을 읽습니다. 실제 앱에서 방금 쓴 마지막 문장까지 포함되는지 추가 실기동 검증이 필요합니다.
- 노트의 문단·목록·표 셀은 텍스트로 표현하고 원래 HTML을 JSON에도 보존합니다. 표의 시각적 배치, 수식 렌더링, 노트에 첨부한 이미지는 완전히 재현하지 않습니다. 특히 노트 이미지 파일은 ZIP에 별도 포함하지 않습니다.

## 검증
33개 자동 테스트 통과: 색상/한글/해석 범위, 취소·중복 실행, 필수 manifest, chrome 등록·해제, 대화상자 입력, PDF 없음/복사 실패, ZIP 실패·CRC 오류, 기존 경로 충돌 등.

별도 실제 임시 파일 테스트에서는 export 코드를 Node/Python 파일 어댑터와 실행하여 ZIP의 세 항목, 한국어 JSON, 원본 및 ZIP 안 PDF의 바이트 일치를 확인했습니다. **이것은 실제 Zotero GUI·네이티브 ZIP API 실행 테스트와 다릅니다.**

실기동 확인 순서: 설치 → 학습 노트 생성 → 작성 → 창 닫기/재시작 후 재열기 → 마지막 문장 입력 직후 내보내기 → 노트 선택 → 저장 취소/재시도 → ZIP의 PDF·한국어·선택 노트 확인 → 폴더 열기. 읽기 전용 공유 라이브러리와 여러 노트도 확인하십시오.

개발 테스트와 빌드에는 Node.js 18+와 Python 3을 사용하며 외부 패키지는 필요 없습니다.
```
node --test tests/*.cjs
python build.py
```

## 업데이트
업데이트 주소는 `https://raw.githubusercontent.com/swsquaredstudio/zotero-paper-learning/main/updates.json`으로 설정했습니다. [0.2.2 베타 릴리스](https://github.com/swsquaredstudio/zotero-paper-learning/releases/tag/v0.2.2)와 실험용 업데이트 피드를 공개했습니다. 피드 다운로드 및 파일 무결성 확인과 실제 Zotero 자동 업그레이드는 별개이며, 실제 업그레이드는 아직 검증 전입니다. 업데이트 확인 시 GitHub에 연결하지만 논문·주석 내용은 전송하지 않습니다. 0.2.0은 이전 예약 주소를 사용하므로 첫 피드 지원 버전을 한 번 수동 설치해야 합니다.

## 변경 이력
- 0.2.2 베타: MIT 라이선스, 공개 업데이트 피드, 안전한 소스 패키징 및 버전 표기 수정.
- 0.2.0: Zotero 네이티브 학습 노트 생성/재열기, 선택 노트 내보내기, 내보내기 요약, 마지막 폴더 기억 및 폴더 열기.
- 0.1.4: 원문 PDF 로컬 복사, 단일 ZIP, 필수 파일·CRC 검사, 누락/실패 처리 추가.
- 0.1.3: chrome 등록 및 XUL window 기반 대화상자, 영어 입력 UI.
- 0.1.2: 필수 update_url 누락 수정, HTTPS .invalid URL 사용.
- 0.1.1: data URL 후보는 보안 검사 우려로 미배포.
- 0.1.0: 초기판. 필수 manifest 항목 누락으로 설치 실패.

공식 대조 자료:
- https://www.zotero.org/support/dev/zotero_7_for_developers
- https://www.zotero.org/support/dev/zotero_10_for_developers
- https://github.com/zotero/zotero/blob/main/chrome/content/zotero/xpcom/file.js
- https://github.com/zotero/zotero/blob/main/chrome/content/zotero/modules/filePicker.mjs
- https://github.com/zotero/zotero/blob/main/chrome/content/zotero/xpcom/data/item.js
- https://github.com/zotero/zotero/blob/main/chrome/content/zotero/newCollectionDialog.xhtml

추가 API 대조: https://github.com/zotero/zotero/blob/main/chrome/content/zotero/zoteroPane.js 및 xpcom/editorInstance.js, xpcom/data/notes.js. 노트 편집기 저장 연결은 Zotero 10 내부 API를 사용하므로 버전 업그레이드 후 재검증이 필요합니다.

## 라이선스
[MIT License](LICENSE). Copyright (c) 2026 swsquaredstudio.
