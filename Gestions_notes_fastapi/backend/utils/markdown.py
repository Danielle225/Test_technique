import re
from typing import List

def extract_tags_from_content(content: str) -> List[str]:
   
    tag_pattern = r'[#@](\w+)'
    tags = re.findall(tag_pattern, content, re.IGNORECASE)
    
    return list(set([tag.lower() for tag in tags if len(tag) > 1]))

def sanitize_markdown(content: str) -> str:
 
    # Supprimer les balises script potentiellement dangereuses
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<iframe[^>]*>.*?</iframe>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    return content.strip()

def get_content_preview(content: str, max_length: int = 150) -> str:
  
    preview = re.sub(r'[#*`_\[\]()]', '', content)
    preview = re.sub(r'\n+', ' ', preview)
    preview = preview.strip()
    
    if len(preview) <= max_length:
        return preview
    
    return preview[:max_length].rsplit(' ', 1)[0] + '...'