import re
from typing import List, Dict, Any, Tuple

# Simple stopwords set to remove noise, including conversational fillers
STOPWORDS = {
    'a', 'about', 'an', 'and', 'at', 'buy', 'can', 'closest', 'could', 'find', 
    'for', 'get', 'hello', 'hey', 'hi', 'how', 'i', 'in', 'is', 'me', 
    'near', 'need', 'closest', 'nearest', 'of', 'on', 'or', 'please', 'purchase', 
    'show', 'tell', 'thank', 'thanks', 'the', 'to', 'want', 'where', 'would', 'you'
}

# Synonym mapping to group user queries with location types or amenities.
# Maps multilingual (ES/PT/FR), sustainability, transportation, accessibility, 
# volunteers, and crowd management queries to standard stadium index keys.
SYNONYMS = {
    # Accessibility
    'accessibility': 'accessibility',
    'accessible': 'accessibility',
    'assistance': 'accessibility',
    'companion': 'accessibility',
    'disabled': 'accessibility',
    'elevator': 'accessibility',
    'elevators': 'accessibility',
    'handicapped': 'accessibility',
    'lift': 'accessibility',
    'ramp': 'accessibility',
    'ramps': 'accessibility',
    'seating': 'accessibility',
    'stroller': 'accessibility',
    'wheelchair': 'accessibility',

    # Concessions & Sustainability (Food, drinks, recycling, water refill)
    'agua': 'concession',          # ES/PT Water
    'alimento': 'concession',      # ES Food
    'alimentos': 'concession',     # ES Foods
    'beer': 'concession',
    'beverage': 'concession',
    'bière': 'concession',         # FR Beer
    'boire': 'concession',         # FR Drink
    'boisson': 'concession',       # FR Drink
    'boissons': 'concession',      # FR Drinks
    'burger': 'concession',
    'burgers': 'concession',
    'cerveja': 'concession',       # PT Beer
    'cerveza': 'concession',       # ES Beer
    'comer': 'concession',         # ES/PT Eat
    'comida': 'concession',        # ES/PT Food
    'comidas': 'concession',       # ES/PT Foods
    'concession': 'concession',
    'concessions': 'concession',
    'drink': 'concession',
    'drinks': 'concession',
    'eat': 'concession',
    'eats': 'concession',
    'eau': 'concession',           # FR Water
    'food': 'concession',
    'garbage': 'concession',       # Sustainability waste
    'hambúrguer': 'concession',    # PT Burger
    'hambúrgueres': 'concession',  # PT Burgers
    'hamburguesa': 'concession',   # ES Burger
    'hamburguesas': 'concession',  # ES Burgers
    'manger': 'concession',        # FR Eat
    'nourriture': 'concession',    # FR Food
    'recycle': 'concession',       # Sustainability recycling
    'recycling': 'concession',     # Sustainability recycling
    'refill': 'concession',        # Sustainability refilling
    'taco': 'concession',
    'tacos': 'concession',
    'trash': 'concession',         # Sustainability waste
    'waste': 'concession',         # Sustainability waste

    # First Aid & Emergency (Medical care)
    'aid': 'first_aid',
    'auxilio': 'first_aid',        # ES Aid
    'blessé': 'first_aid',         # FR Injured
    'blessés': 'first_aid',        # FR Injured plural
    'doctor': 'first_aid',
    'doente': 'first_aid',         # PT Sick
    'doentes': 'first_aid',        # PT Sick plural
    'dolor': 'first_aid',          # ES/PT Pain
    'dor': 'first_aid',            # PT Pain
    'emergency': 'first_aid',
    'emergencia': 'first_aid',     # ES Emergency
    'emergência': 'first_aid',     # PT Emergency
    'emergencias': 'first_aid',    # ES Emergency plural
    'emergências': 'first_aid',    # PT Emergency plural
    'enfermera': 'first_aid',      # ES Nurse
    'enfermeira': 'first_aid',     # PT Nurse
    'enfermero': 'first_aid',      # ES Nurse
    'enfermeiro': 'first_aid',     # PT Nurse
    'enfermo': 'first_aid',        # ES Sick
    'enfermos': 'first_aid',       # ES Sick plural
    'first aid': 'first_aid',
    'herido': 'first_aid',         # ES/PT Injured
    'heridos': 'first_aid',        # ES/PT Injured plural
    'hospital': 'first_aid',
    'hurt': 'first_aid',
    'infirmerie': 'first_aid',     # FR First aid bay
    'infirmier': 'first_aid',      # FR Nurse
    'infirmière': 'first_aid',     # FR Nurse
    'injured': 'first_aid',
    'injury': 'first_aid',
    'machucado': 'first_aid',      # PT Injured
    'mal': 'first_aid',            # FR Pain
    'malade': 'first_aid',         # FR Sick
    'malades': 'first_aid',        # FR Sick plural
    'medical': 'first_aid',
    'médical': 'first_aid',        # FR Medical
    'medicine': 'first_aid',
    'médecin': 'first_aid',        # FR Doctor
    'médecins': 'first_aid',       # FR Doctors
    'médico': 'first_aid',         # ES/PT Doctor
    'médicos': 'first_aid',        # ES/PT Doctors
    'nurse': 'first_aid',
    'premier secours': 'first_aid', # FR First aid
    'premiers secours': 'first_aid', # FR First aid
    'primeros auxilios': 'first_aid', # ES First aid
    'primeiros socorros': 'first_aid', # PT First aid
    'secours': 'first_aid',        # FR Aid/Rescue
    'sick': 'first_aid',
    'socorro': 'first_aid',        # PT Aid/Rescue
    'urgence': 'first_aid',        # FR Emergency
    'urgences': 'first_aid',       # FR Emergency plural
    'urgencias': 'first_aid',      # ES Emergency plural

    # Gates, Entrances, Exits, Volunteers, and Crowd Management
    'acceso': 'gate',              # ES/PT Access
    'accesos': 'gate',             # ES/PT Access plural
    'accès': 'gate',               # FR Access
    'busy': 'gate',                # Crowd status
    'congestion': 'gate',          # Crowd flow
    'crowd': 'gate',               # Crowd management
    'entrance': 'gate',
    'entrances': 'gate',
    'entrée': 'gate',              # FR Entrance
    'entrées': 'gate',             # FR Entrance plural
    'entry': 'gate',
    'exit': 'gate',
    'exits': 'gate',
    'gate': 'gate',
    'gates': 'gate',
    'help': 'gate',                # Info/Help desk
    'info': 'gate',                # Info/Help desk
    'information': 'gate',         # Info/Help desk
    'line': 'gate',                # Waiting line
    'porta': 'gate',               # PT Gate
    'portas': 'gate',              # PT Gate plural
    'porte': 'gate',               # FR Gate
    'portes': 'gate',              # FR Gate plural
    'puerta': 'gate',              # ES Gate
    'puertas': 'gate',             # ES Gate plural
    'queue': 'gate',               # Crowd queue
    'saída': 'gate',               # PT Exit
    'saídas': 'gate',              # PT Exit plural
    'salida': 'gate',              # ES Exit
    'salidas': 'gate',             # ES Exit plural
    'sortie': 'gate',              # FR Exit
    'sorties': 'gate',             # FR Exit plural
    'volunteer': 'gate',           # Volunteer
    'waiting': 'gate',             # Waiting queue

    # Restrooms
    'bathroom': 'restroom',
    'bathrooms': 'restroom',
    'baño': 'restroom',            # ES Restroom
    'baños': 'restroom',           # ES Restrooms
    'banheiro': 'restroom',        # PT Restroom
    'banheiros': 'restroom',       # PT Restrooms
    'cabinet': 'restroom',         # FR Toilet cabin
    'cabinets': 'restroom',        # FR Toilet cabins
    'restroom': 'restroom',
    'restrooms': 'restroom',
    'toilet': 'restroom',
    'toilets': 'restroom',
    'toilette': 'restroom',        # FR Toilet
    'toilettes': 'restroom',       # FR Toilets
    'washroom': 'restroom',
    'washrooms': 'restroom',
    'wc': 'restroom',

    # Parking, Shuttles & Transportation
    'airport': 'parking',
    'aparcamiento': 'parking',     # ES Parking
    'aparcamientos': 'parking',    # ES Parking plural
    'autobús': 'parking',          # ES Bus
    'autobus': 'parking',          # FR Bus
    'autocarro': 'parking',        # PT Bus
    'bus': 'parking',
    'buses': 'parking',
    'car': 'parking',
    'charging': 'parking',         # EV Charging
    'coche': 'parking',            # ES Car
    'coches': 'parking',           # ES Cars
    'estacionamiento': 'parking',  # ES/PT Parking
    'estacionamentos': 'parking', # ES/PT Parking plural
    'ev': 'parking',               # EV charging
    'lanzadera': 'parking',        # ES Shuttle
    'metro': 'parking',
    'navette': 'parking',          # FR Shuttle
    'navettes': 'parking',         # FR Shuttles
    'ônibus': 'parking',           # PT Bus
    'parking': 'parking',
    'parkings': 'parking',         # FR Parkings
    'shuttle': 'parking',
    'stationnement': 'parking',    # FR Parking
    'stationnements': 'parking',   # FR Parking plural
    'taxi': 'parking',
    'train': 'parking',
    'transporte': 'parking',       # ES/PT Transit
    'trem': 'parking',             # PT Train
    'vehicle': 'parking',
    'voiture': 'parking',          # FR Car
    'voitures': 'parking'          # FR Cars
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
