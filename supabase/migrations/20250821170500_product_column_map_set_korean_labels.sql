-- Set Korean labels (sheet_label_kr) for all known product columns
begin;

-- Core required
update public.product_column_map set sheet_label_kr='품번' where db_column='product_code';
update public.product_column_map set sheet_label_kr='품명' where db_column='name_kr';
update public.product_column_map set sheet_label_kr='품목자산분류' where db_column='asset_category';

update public.product_column_map set sheet_label_kr='등록상태' where db_column='item_status';
update public.product_column_map set sheet_label_kr='등록일자' where db_column='reg_date';
update public.product_column_map set sheet_label_kr='등록자' where db_column='reg_user';
update public.product_column_map set sheet_label_kr='최종수정일자' where db_column='last_update_date';
update public.product_column_map set sheet_label_kr='최종수정자' where db_column='last_update_user';
update public.product_column_map set sheet_label_kr='내외국구분' where db_column='domestic_overseas';
update public.product_column_map set sheet_label_kr='품목소분류' where db_column='item_subcategory';
update public.product_column_map set sheet_label_kr='중요도' where db_column='importance';
update public.product_column_map set sheet_label_kr='관리부서' where db_column='managing_department';
update public.product_column_map set sheet_label_kr='관리자' where db_column='manager';
update public.product_column_map set sheet_label_kr='품목대분류' where db_column='item_category';
update public.product_column_map set sheet_label_kr='품목중분류' where db_column='item_midcategory';
update public.product_column_map set sheet_label_kr='출하형태' where db_column='shipping_type';
update public.product_column_map set sheet_label_kr='대표품목' where db_column='is_main_item';
update public.product_column_map set sheet_label_kr='세트품목' where db_column='is_set_item';
update public.product_column_map set sheet_label_kr='BOM등록여부' where db_column='is_bom_registered';
update public.product_column_map set sheet_label_kr='재공품재료사용' where db_column='has_process_materials';
update public.product_column_map set sheet_label_kr='Lot관리' where db_column='lot_control';
update public.product_column_map set sheet_label_kr='Serial관리' where db_column='serial_control';
update public.product_column_map set sheet_label_kr='검사대상' where db_column='inspection_target';
update public.product_column_map set sheet_label_kr='유통기간형태' where db_column='shelf_life_type';
update public.product_column_map set sheet_label_kr='유통기간' where db_column='shelf_life_period';
update public.product_column_map set sheet_label_kr='SM자산그룹' where db_column='sm_asset_grp';
update public.product_column_map set sheet_label_kr='기본구매처' where db_column='default_supplier';
update public.product_column_map set sheet_label_kr='부가세유형' where db_column='vat_type';
update public.product_column_map set sheet_label_kr='판매가격에부가세포함여부' where db_column='sale_price_includes_vat';
update public.product_column_map set sheet_label_kr='첨부파일' where db_column='attachment';
update public.product_column_map set sheet_label_kr='이미지' where db_column='image_url';
update public.product_column_map set sheet_label_kr='대표품명' where db_column='main_name';
update public.product_column_map set sheet_label_kr='대표품번' where db_column='main_code';
update public.product_column_map set sheet_label_kr='대표규격' where db_column='main_spec';
update public.product_column_map set sheet_label_kr='규격' where db_column='spec';
update public.product_column_map set sheet_label_kr='영문명' where db_column='name_en';
update public.product_column_map set sheet_label_kr='품목설명' where db_column='remarks';
update public.product_column_map set sheet_label_kr='기준단위' where db_column='unit';
update public.product_column_map set sheet_label_kr='세부품목' where db_column='item_subdivision';
update public.product_column_map set sheet_label_kr='검색어(이명)' where db_column='keywords_alias';
update public.product_column_map set sheet_label_kr='사양' where db_column='specification';
update public.product_column_map set sheet_label_kr='품목특이사항' where db_column='special_notes';

-- Scientific / compliance
update public.product_column_map set sheet_label_kr='CAS' where db_column='cas_no';
update public.product_column_map set sheet_label_kr='MOQ' where db_column='moq';
update public.product_column_map set sheet_label_kr='포장단위' where db_column='package_unit';
update public.product_column_map set sheet_label_kr='Manufacturer' where db_column='manufacturer';
update public.product_column_map set sheet_label_kr='Country of Manufacture' where db_column='country_of_manufacture';
update public.product_column_map set sheet_label_kr='Source of Origin(Method)' where db_column='source_of_origin_method';
update public.product_column_map set sheet_label_kr='Plant Part' where db_column='plant_part';
update public.product_column_map set sheet_label_kr='Country of Origin' where db_column='country_of_origin';
update public.product_column_map set sheet_label_kr='중국원료신고번호(NMPA)' where db_column='nmpa_no';
update public.product_column_map set sheet_label_kr='알러젠성분' where db_column='allergen';
update public.product_column_map set sheet_label_kr='Furocoumarines' where db_column='furocoumarins';
update public.product_column_map set sheet_label_kr='효능' where db_column='efficacy';
update public.product_column_map set sheet_label_kr='특허' where db_column='patent';
update public.product_column_map set sheet_label_kr='논문' where db_column='paper';
update public.product_column_map set sheet_label_kr='임상' where db_column='clinical';
update public.product_column_map set sheet_label_kr='사용기한' where db_column='expiration_date';
update public.product_column_map set sheet_label_kr='보관위치' where db_column='storage_location';
update public.product_column_map set sheet_label_kr='보관방법1' where db_column='storage_method1';
update public.product_column_map set sheet_label_kr='안정성 및 유의사항1' where db_column='stability_note1';
update public.product_column_map set sheet_label_kr='Note on storage1' where db_column='storage_note1';
update public.product_column_map set sheet_label_kr='안전 및 취급 주의사항1' where db_column='safety_handling1';
update public.product_column_map set sheet_label_kr='NOTICE(COA3 영문)1' where db_column='notice_coa3_en_1';
update public.product_column_map set sheet_label_kr='NOTICE(COA3 국문)1' where db_column='notice_coa3_kr_1';
update public.product_column_map set sheet_label_kr='NOTICE(Composition 국문)1' where db_column='notice_comp_kr_1';
update public.product_column_map set sheet_label_kr='NOTICE(Composition 영문)1' where db_column='notice_comp_en_1';
update public.product_column_map set sheet_label_kr='CAUTION(Origin)1' where db_column='caution_origin_1';
update public.product_column_map set sheet_label_kr='KOSHER 인증' where db_column='cert_kosher';
update public.product_column_map set sheet_label_kr='HALAL 인증' where db_column='cert_halal';
update public.product_column_map set sheet_label_kr='VEGAN 인증' where db_column='cert_vegan';
update public.product_column_map set sheet_label_kr='ISAAA 인증' where db_column='cert_isaaa';
update public.product_column_map set sheet_label_kr='RSPO 인증' where db_column='cert_rspo';
update public.product_column_map set sheet_label_kr='REACH 인증' where db_column='cert_reach';
update public.product_column_map set sheet_label_kr='Expiration Date2' where db_column='expiration_date2';
update public.product_column_map set sheet_label_kr='보관방법2' where db_column='storage_method2';
update public.product_column_map set sheet_label_kr='안정성 및 유의사항2' where db_column='stability_note2';
update public.product_column_map set sheet_label_kr='Note on storage2' where db_column='storage_note2';
update public.product_column_map set sheet_label_kr='안전 및 취급 주의사항2' where db_column='safety_handling2';
update public.product_column_map set sheet_label_kr='NOTICE(COA3 영문)2' where db_column='notice_coa3_en_2';
update public.product_column_map set sheet_label_kr='NOTICE(COA3 국문)2' where db_column='notice_coa3_kr_2';
update public.product_column_map set sheet_label_kr='NOTICE(Composition 국문)2' where db_column='notice_comp_kr_2';
update public.product_column_map set sheet_label_kr='NOTICE(Composition 영문)2' where db_column='notice_comp_en_2';
update public.product_column_map set sheet_label_kr='CAUTION(Origin)2' where db_column='caution_origin_2';

commit;


