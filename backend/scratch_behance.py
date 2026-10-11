import urllib.request
import re

url = "https://www.behance.net/embed/project/240513725?ilo0=1"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        title = re.search(r'<title>(.*?)</title>', html)
        print("TITLE:", title.group(1) if title else "None")
        og_img = re.search(r'<meta property="og:image" content="(.*?)"', html)
        print("OG_IMAGE:", og_img.group(1) if og_img else "None")
        og_desc = re.search(r'<meta property="og:description" content="(.*?)"', html)
        print("OG_DESC:", og_desc.group(1) if og_desc else "None")
        matches = re.findall(r'https://mir-s3-cdn-cf.behance.net/project_modules/[^\s"\'>]+', html)
        print("MODULE IMAGES:", list(set(matches))[:5])
except Exception as e:
    print("ERROR:", e)
