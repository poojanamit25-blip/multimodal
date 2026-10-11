import re

with open('backend/behance_embed.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print("File size:", len(text))
title_match = re.search(r'<title>(.*?)</title>', text)
print("TITLE:", title_match.group(1) if title_match else "No title")

# Find any project URLs, names or descriptions
og_title = re.search(r'<meta property="og:title" content="(.*?)"', text)
print("OG_TITLE:", og_title.group(1) if og_title else "No og:title")

og_desc = re.search(r'<meta property="og:description" content="(.*?)"', text)
print("OG_DESC:", og_desc.group(1) if og_desc else "No og:desc")

# Find all behance project modules image links
imgs = re.findall(r'https://mir-s3-cdn-cf.behance.net/[^\s"\'<>]+', text)
unique_imgs = list(set(imgs))
print("IMAGES COUNT:", len(unique_imgs))
for img in unique_imgs[:10]:
    print("IMG:", img)
