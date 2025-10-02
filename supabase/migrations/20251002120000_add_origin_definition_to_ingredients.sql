-- Add origin_definition column to ingredients table
ALTER TABLE ingredients
ADD COLUMN origin_definition TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN ingredients.origin_definition IS '기원 및 정의: 성분의 기원과 정의에 대한 설명';

