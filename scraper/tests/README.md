# Scraper Tests & Linting

이 프로젝트는 `ruff`를 이용한 린팅과 `pytest`를 이용한 단위 테스트를 수행합니다.

## Requirements
테스트를 위해 아래 패키지가 설치되어 있어야 합니다.
```bash
pip install ruff pytest pytest-asyncio
```

## Linting (ruff)
코드 스타일 및 잠재적 오류를 검사합니다.
```bash
# 검사
ruff check src/

# 자동 수정
ruff check --fix src/
```

## Testing (pytest)
비동기 클라이언트 및 유틸리티 로직을 테스트합니다.
```bash
# 전체 테스트 실행
python -m pytest tests/

# 상세 결과 출력
python -m pytest -v tests/
```

## CI/CD
GitHub Actions을 통해 푸시 시 자동으로 위 검증을 수행하도록 구성하는 것을 권장합니다.
