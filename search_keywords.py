import json

with open('figma_strings.json', 'r', encoding='utf-8') as f:
    strings = json.load(f)

keywords = ['شقة', 'فيلا', 'مكتب', 'عقار', 'إيجار', 'بيع', 'غرفة', 'دمشق', 'حلب', 'الميدان', 'معاينة', 'عقد', 'سعر', 'بحث', 'فلترة']
with open('keywords_summary.txt', 'w', encoding='utf-8') as out:
    for k in keywords:
        matches = [s for s in strings if k in s]
        out.write(f'=== {k} ({len(matches)}) ===\n')
        for m in matches[:10]:
            out.write(f'  - {m}\n')
        out.write('\n')

print('Written keywords_summary.txt')
