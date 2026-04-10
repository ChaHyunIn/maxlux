# Hotel name Korean mapping (English → Korean)
# TODO: HOTEL_KO_MAPPING은 DB hotels.name_ko에서 기존값을 조회하여 fallback으로 사용하도록 변경 필요.
# 현재는 신규 호텔 추가 시 이 딕셔너리를 수동 업데이트해야 함.

# NOTE: BRAND_MAPPING은 apps/web/lib/brandMapper.ts의 BRAND_DISPLAY_MAP과 동기화 필요.
# TODO: 장기적으로 DB에 brand_key 컬럼을 두고 프론트엔드는 DB 값을 그대로 사용하도록 개선.

# TODO: migrate this mapping to a `hotel_translations` DB table for multi-city scalability.
# API currently requires hardcoded names for some instances.
HOTEL_KO_MAPPING = {
    "Andaz Seoul Gangnam": "안다즈 서울 강남",
    "Grand Hyatt Seoul": "그랜드 하얏트 서울",
    "Four Seasons Hotel Seoul": "포시즌스 호텔 서울",
    "Josun Palace, a Luxury Collection Hotel, Seoul Gangnam": "조선 팰리스 서울 강남",
    " JW Marriott Hotel Seoul": "JW 메리어트 호텔 서울",
    "JW Marriott Hotel Seoul": "JW 메리어트 호텔 서울",
    "The Westin Josun Seoul": "웨스틴 조선 서울",
    "Jw Marriott Dongdaemun Square": "JW 메리어트 동대문 스퀘어",
    "Signiel Seoul": "시그니엘 서울",
    "Sofitel Ambassador Seoul Hotel & Serviced Residences": "소피텔 앰배서더 서울",
    "Hotel Naru Seoul MGallery Ambassador": "호텔 나루 서울 엠갤러리",
    "voco Seoul Myeongdong": "보코 서울 명동",
    "Park Hyatt Seoul": "파크 하얏트 서울",
    "The Westin Seoul Parnas": "웨스틴 서울 파르나스",
    "Hotel28 Myeongdong": "호텔28 명동",
    "Novotel Suites Ambassador Seoul Yongsan": "노보텔 스위트 앰배서더 서울 용산",
    "Grand InterContinental Seoul Parnas": "그랜드 인터컨티넨탈 서울 파르나스",
    "Fairmont Ambassador Seoul": "페어몬트 앰배서더 서울",
    "Conrad Seoul": "콘래드 서울",
    "Mondrian Seoul Itaewon": "몬드리안 서울 이태원",
    "The Shilla Seoul": "서울 신라호텔",
    "Lotte Hotel Seoul - Executive Tower": "롯데호텔 서울 이그제큐티브 타워",
}

# Brand name Chinese → Korean mapping
BRAND_MAPPING = {
    "柏悦": "파크 하얏트",
    "洲际": "인터컨티넨탈",
    "安达仕": "안다즈",
    "豪华精选": "럭셔리 컬렉션",
    "康莱德": "콘래드",
    "悦榕庄": "반얀트리",
    "索菲特": "소피텔",
    "铂尔曼": "풀만",
    "诺富特": "노보텔",
    "美爵": "그랜드 머큐어",
    "君悦": "그랜드 하얏트",
    "万豪": "메리어트",
    "威斯汀": "웨스틴",
    "JW万豪": "JW 메리어트",
    "艾美": "르메르디앙",
    "福朋喜来登": "포포인츠",
    "臻品之选": "트리뷰트 포트폴리오",
    "万枫": "페어필드",
    "傲途格精选": "오토그래프 컬렉션",
    "AC酒店": "AC 호텔",
    "VOCO": "보코",
    "蒙德里安": "몬드리안",
    "美憬阁": "엠갤러리",
    "SLH": "SLH (스몰 럭셔리 호텔)",
    "其他酒店品牌": "기타",
}

# City name mapping (raw API value → normalized)
CITY_MAPPING = {
    # Seoul
    "首尔": "seoul",
    "Seoul": "seoul",
    "seoul": "seoul",
    # Busan
    "釜山": "busan",
    "Busan": "busan",
    "busan": "busan",
    # Jeju
    "济州": "jeju",
    "제주": "jeju",
    "Jeju": "jeju",
    "jeju": "jeju",
}


def get_city(raw_city: str) -> str:
    return CITY_MAPPING.get(raw_city, raw_city.lower())
