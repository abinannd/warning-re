import urllib.request
import json
url = 'https://api.github.com/search/code?q=kerala+district+extension:geojson'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print(f'Found {res.get("total_count", 0)} results')
        for item in res.get("items", [])[:5]:
            print(item['html_url'])
            print(item['repository']['html_url'])
except Exception as e:
    print('Failed:', e)
