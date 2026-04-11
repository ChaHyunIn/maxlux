import { describe, it, expect, vi, beforeEach } from 'vitest';

// route handler 직접 import
import { GET } from '@/app/api/price-changes/route';

// Supabase 쿼리 모킹
vi.mock('@/lib/supabase/queries/rates', () => ({
  getPriceChanges: vi.fn(),
}));

import { getPriceChanges } from '@/lib/supabase/queries/rates';

const mockGetPriceChanges = vi.mocked(getPriceChanges);

function createRequest(url: string) {
  return new Request(url);
}

describe('GET /api/price-changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hotelId 누락 시 400 반환', async () => {
    const req = createRequest('http://localhost/api/price-changes');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('MISSING_HOTEL_ID');
  });

  it('hotelId가 UUID 형식이 아니면 400 반환', async () => {
    const req = createRequest('http://localhost/api/price-changes?hotelId=not-a-uuid');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_PARAMS');
  });

  it('정상 요청 시 200 + changes 배열 반환', async () => {
    const mockData = [
      { id: 1, hotel_id: '550e8400-e29b-41d4-a716-446655440000', old_price: 300000, new_price: 250000 }
    ];
    mockGetPriceChanges.mockResolvedValue(mockData as any);

    const req = createRequest('http://localhost/api/price-changes?hotelId=550e8400-e29b-41d4-a716-446655440000');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.changes).toEqual(mockData);
    expect(mockGetPriceChanges).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 20);
  });

  it('limit 파라미터 전달 확인', async () => {
    mockGetPriceChanges.mockResolvedValue([]);

    const req = createRequest('http://localhost/api/price-changes?hotelId=550e8400-e29b-41d4-a716-446655440000&limit=5');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockGetPriceChanges).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', 5);
  });

  it('getPriceChanges가 throw하면 500 반환', async () => {
    mockGetPriceChanges.mockRejectedValue(new Error('DB error'));

    const req = createRequest('http://localhost/api/price-changes?hotelId=550e8400-e29b-41d4-a716-446655440000');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('FETCH_FAILED');
  });
});
