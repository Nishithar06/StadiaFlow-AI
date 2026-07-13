import re
from typing import List, Dict, Any, Tuple

# Simple stopwords set to remove noise
STOPWORDS = {
    'where', 'is', 'the', 'a', 'an', 'at', 'in', 'on', 'to', 'for', 'of', 'and', 'or', 
    'how', 'can', 'i', 'find', 'get', 'to', 'near', 'closest', 'nearest', 'show', 'me', 
    'please', 'want', 'buy', 'purchase', 'need', 'about'
}

# Synonym mapping to group user queries with location types or amenities
SYNONYMS = {
    # Restrooms
    'restroom': 'restroom',
    'restrooms': 'restroom',
    'toilet': 'restroom',
    'toilets': 'restroom',
    'washroom': 'restroom',
    'washrooms': 'restroom',
    'bathroom': 'restroom',
    'bathrooms': 'restroom',
    'wc': 'restroom',
    
    # Concessions
    'food': 'concession',
    'eat': 'concession',
    'eats': 'concession',
    'drink': 'concession',
    'drinks': 'concession',
    'burger': 'concession',
    'burgers': 'concession',
    'taco': 'concession',
    'tacos': 'concession',
    'concession': 'concession',
    'concessions': 'concession',
    'beer': 'concession',
    'beverage': 'concession',
    
    # Gates
    'gate': 'gate',
    'gates': 'gate',
    'entrance': 'gate',
    'entrances': 'gate',
    'entry': 'gate',
    'exit': 'gate',
    'exits': 'gate',
    
    # First Aid
    'medical': 'first_aid',
    'medicine': 'first_aid',
    'doctor': 'first_aid',
    'nurse': 'first_aid',
    'first aid': 'first_aid',
    'aid': 'first_aid',
    'hurt': 'first_aid',
    'injury': 'first_aid',
    'injured': 'first_aid',
    'emergency': 'first_aid',
    'sick': 'first_aid',
    'hospital': 'first_aid'
}


def tokenize(text: str) -> List[str]:
    """
    Lowercase text, remove special chars, and split into tokens.
    """
    text_clean = re.sub(r'[^\w\s]', ' ', text.lower())
    return [word for word in text_clean.split() if word and word not in STOPWORDS]


def get_synonym_resolved_tokens(tokens: List[str]) -> List[str]:
    """
    Maps tokens to their normalized category tokens using synonym map.
    """
    resolved = []
    for token in tokens:
        resolved.append(token)
        # Check if the token or token phrases map to a category
        if token in SYNONYMS:
            resolved.append(SYNONYMS[token])
    return list(set(resolved))


def compute_jaccard_similarity(set_a: set, set_b: set) -> float:
    """
    Computes standard Jaccard Similarity between two sets.
    """
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return float(intersection) / union


def semantic_search(query: str, locations: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], float]:
    """
    Scores and matches locations against user queries.
    Uses token overlaps, synonym expansion, and Jaccard similarity.
    
    Returns:
        - List of matched location dictionaries.
        - Confidence rating from 0.0 to 1.0.
    """
    query_tokens = tokenize(query)
    resolved_query_tokens = set(get_synonym_resolved_tokens(query_tokens))
    
    if not resolved_query_tokens:
        return [], 0.0
        
    scored_locations = []
    
    for loc in locations:
        score = 0.0
        
        loc_name = loc.get("name", "")
        loc_type = loc.get("type", "")
        loc_section = loc.get("section", "")
        loc_description = loc.get("description", "")
        loc_amenities = loc.get("amenities", [])
        
        # Tokenize location metadata
        loc_tokens = set(tokenize(f"{loc_name} {loc_type} {loc_description}"))
        for amenity in loc_amenities:
            loc_tokens.update(tokenize(amenity))
            
        # Add section explicitly as token
        loc_tokens.add(loc_section.lower())
        
        # 1. Base Jaccard Similarity
        jaccard_score = compute_jaccard_similarity(resolved_query_tokens, loc_tokens)
        score += jaccard_score * 0.4 # Weight: 40% of score
        
        # 2. Key Term Overlap Weights (boost exact matches)
        # Match against Type (e.g. user asks for "restroom" and type is "restroom")
        if loc_type.lower() in resolved_query_tokens:
            score += 0.35
            
        # Match against Name tokens
        name_tokens = set(tokenize(loc_name))
        name_intersection = resolved_query_tokens.intersection(name_tokens)
        if name_intersection:
            score += 0.25 * (len(name_intersection) / len(name_tokens))
            
        # Match against Section number
        if loc_section.lower() in resolved_query_tokens:
            score += 0.4
            
        # Match against Amenities
        amenities_tokens = set()
        for amenity in loc_amenities:
            amenities_tokens.update(tokenize(amenity))
        amenities_intersection = resolved_query_tokens.intersection(amenities_tokens)
        if amenities_intersection:
            score += 0.2 * (len(amenities_intersection) / max(len(amenities_tokens), 1))

        # Cap individual location scores to 1.0
        final_score = min(score, 1.0)
        
        if final_score > 0.05:
            scored_locations.append((loc, final_score))
            
    # Sort locations by score descending
    scored_locations.sort(key=lambda x: x[1], reverse=True)
    
    if not scored_locations:
        return [], 0.0
        
    # Get highest score
    best_score = scored_locations[0][1]
    
    # Pick matches that are close to the best score (within 0.15 limit)
    matches = [loc for loc, score in scored_locations if score >= max(best_score - 0.15, 0.1)]
    
    return matches, float(best_score)
