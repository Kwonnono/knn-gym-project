export interface FoodPreset {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
}

export const FOOD_PRESETS: FoodPreset[] = [
  { name: '닭가슴살', caloriesPer100g: 165, proteinPer100g: 31, carbPer100g: 0, fatPer100g: 3.6 },
  { name: '닭다리살', caloriesPer100g: 209, proteinPer100g: 26, carbPer100g: 0, fatPer100g: 11 },
  { name: '계란', caloriesPer100g: 155, proteinPer100g: 13, carbPer100g: 1.1, fatPer100g: 11 },
  { name: '삶은계란 흰자', caloriesPer100g: 52, proteinPer100g: 11, carbPer100g: 0.7, fatPer100g: 0.2 },
  { name: '흰쌀밥', caloriesPer100g: 130, proteinPer100g: 2.7, carbPer100g: 28, fatPer100g: 0.3 },
  { name: '현미밥', caloriesPer100g: 123, proteinPer100g: 2.6, carbPer100g: 26, fatPer100g: 1 },
  { name: '고구마', caloriesPer100g: 86, proteinPer100g: 1.6, carbPer100g: 20, fatPer100g: 0.1 },
  { name: '감자', caloriesPer100g: 77, proteinPer100g: 2, carbPer100g: 17, fatPer100g: 0.1 },
  { name: '두부', caloriesPer100g: 76, proteinPer100g: 8, carbPer100g: 1.9, fatPer100g: 4.8 },
  { name: '그릭요거트', caloriesPer100g: 59, proteinPer100g: 10, carbPer100g: 3.6, fatPer100g: 0.4 },
  { name: '요거트(가당)', caloriesPer100g: 97, proteinPer100g: 3.5, carbPer100g: 15, fatPer100g: 2.7 },
  { name: '우유', caloriesPer100g: 50, proteinPer100g: 3.4, carbPer100g: 5, fatPer100g: 2 },
  { name: '두유', caloriesPer100g: 33, proteinPer100g: 3.3, carbPer100g: 1.8, fatPer100g: 1.8 },
  { name: '바나나', caloriesPer100g: 89, proteinPer100g: 1.1, carbPer100g: 23, fatPer100g: 0.3 },
  { name: '사과', caloriesPer100g: 52, proteinPer100g: 0.3, carbPer100g: 14, fatPer100g: 0.2 },
  { name: '아몬드', caloriesPer100g: 579, proteinPer100g: 21, carbPer100g: 22, fatPer100g: 50 },
  { name: '땅콩버터', caloriesPer100g: 588, proteinPer100g: 25, carbPer100g: 20, fatPer100g: 50 },
  { name: '연어', caloriesPer100g: 208, proteinPer100g: 20, carbPer100g: 0, fatPer100g: 13 },
  { name: '참치캔(물)', caloriesPer100g: 116, proteinPer100g: 26, carbPer100g: 0, fatPer100g: 1 },
  { name: '소고기 등심', caloriesPer100g: 250, proteinPer100g: 26, carbPer100g: 0, fatPer100g: 15 },
  { name: '돼지고기 안심', caloriesPer100g: 143, proteinPer100g: 26, carbPer100g: 0, fatPer100g: 3.5 },
  { name: '삼겹살', caloriesPer100g: 331, proteinPer100g: 17, carbPer100g: 0, fatPer100g: 30 },
  { name: '새우', caloriesPer100g: 99, proteinPer100g: 24, carbPer100g: 0.2, fatPer100g: 0.3 },
  { name: '오트밀', caloriesPer100g: 389, proteinPer100g: 17, carbPer100g: 66, fatPer100g: 7 },
  { name: '통밀빵', caloriesPer100g: 247, proteinPer100g: 13, carbPer100g: 41, fatPer100g: 3.4 },
  { name: '파스타(삶은)', caloriesPer100g: 131, proteinPer100g: 5, carbPer100g: 25, fatPer100g: 1.1 },
  { name: '라면(건면)', caloriesPer100g: 476, proteinPer100g: 10, carbPer100g: 65, fatPer100g: 19 },
  { name: '브로콜리', caloriesPer100g: 34, proteinPer100g: 2.8, carbPer100g: 7, fatPer100g: 0.4 },
  { name: '시금치', caloriesPer100g: 23, proteinPer100g: 2.9, carbPer100g: 3.6, fatPer100g: 0.4 },
  { name: '김치', caloriesPer100g: 15, proteinPer100g: 1.1, carbPer100g: 2.4, fatPer100g: 0.5 },
  { name: '아보카도', caloriesPer100g: 160, proteinPer100g: 2, carbPer100g: 9, fatPer100g: 15 },
  { name: '치즈(체다)', caloriesPer100g: 402, proteinPer100g: 25, carbPer100g: 1.3, fatPer100g: 33 },
  { name: '크림치즈', caloriesPer100g: 342, proteinPer100g: 6, carbPer100g: 4, fatPer100g: 34 },
  { name: '프로틴 파우더', caloriesPer100g: 400, proteinPer100g: 80, carbPer100g: 8, fatPer100g: 5 },
  { name: '닭가슴살 소시지', caloriesPer100g: 120, proteinPer100g: 15, carbPer100g: 5, fatPer100g: 4 }
];
