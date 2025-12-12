#!/usr/bin/env python3
"""
Download yoga pose images from Pexels (free, no API key required for basic use)
This script downloads one image per yoga pose and saves them to the frontend images directory.
"""

import os
import requests
import time
from urllib.parse import quote

# All 47 yoga poses
POSES = [
    'Adho Mukha Svanasana',
    'Adho Mukha Vrksasana',
    'Alanasana',
    'Anjaneyasana',
    'Ardha Chandrasana',
    'Ardha Matsyendrasana',
    'Ardha Navasana',
    'Ardha Pincha Mayurasana',
    'Ashta Chandrasana',
    'Baddha Konasana',
    'Bakasana',
    'Balasana',
    'Bitilasana',
    'Camatkarasana',
    'Dhanurasana',
    'Eka Pada Rajakapotasana',
    'Garudasana',
    'Halasana',
    'Hanumanasana',
    'Malasana',
    'Marjaryasana',
    'Navasana',
    'Padmasana',
    'Parsva Virabhadrasana',
    'Parsvottanasana',
    'Paschimottanasana',
    'Phalakasana',
    'Pincha Mayurasana',
    'Salamba Bhujangasana',
    'Salamba Sarvangasana',
    'Setu Bandha Sarvangasana',
    'Sivasana',
    'Supta Kapotasana',
    'Trikonasana',
    'Upavistha Konasana',
    'Urdhva Dhanurasana',
    'Urdhva Mukha Svsnssana',
    'Ustrasana',
    'Utkatasana',
    'Uttanasana',
    'Utthita Hasta Padangusthasana',
    'Utthita Parsvakonasana',
    'Vasisthasana',
    'Virabhadrasana One',
    'Virabhadrasana Three',
    'Virabhadrasana Two',
    'Vrksasana'
]

# Simplified pose names for better search results
POSE_SEARCH_TERMS = {
    'Adho Mukha Svanasana': 'downward dog yoga',
    'Adho Mukha Vrksasana': 'handstand yoga',
    'Alanasana': 'high lunge yoga',
    'Anjaneyasana': 'low lunge yoga',
    'Ardha Chandrasana': 'half moon pose yoga',
    'Ardha Matsyendrasana': 'seated twist yoga',
    'Ardha Navasana': 'half boat pose yoga',
    'Ardha Pincha Mayurasana': 'dolphin pose yoga',
    'Ashta Chandrasana': 'crescent lunge yoga',
    'Baddha Konasana': 'butterfly pose yoga',
    'Bakasana': 'crow pose yoga',
    'Balasana': 'child pose yoga',
    'Bitilasana': 'cow pose yoga',
    'Camatkarasana': 'wild thing yoga',
    'Dhanurasana': 'bow pose yoga',
    'Eka Pada Rajakapotasana': 'pigeon pose yoga',
    'Garudasana': 'eagle pose yoga',
    'Halasana': 'plow pose yoga',
    'Hanumanasana': 'splits yoga',
    'Malasana': 'squat yoga',
    'Marjaryasana': 'cat pose yoga',
    'Navasana': 'boat pose yoga',
    'Padmasana': 'lotus pose yoga',
    'Parsva Virabhadrasana': 'reverse warrior yoga',
    'Parsvottanasana': 'pyramid pose yoga',
    'Paschimottanasana': 'seated forward bend yoga',
    'Phalakasana': 'plank pose yoga',
    'Pincha Mayurasana': 'forearm stand yoga',
    'Salamba Bhujangasana': 'sphinx pose yoga',
    'Salamba Sarvangasana': 'shoulder stand yoga',
    'Setu Bandha Sarvangasana': 'bridge pose yoga',
    'Sivasana': 'corpse pose yoga',
    'Supta Kapotasana': 'reclined pigeon yoga',
    'Trikonasana': 'triangle pose yoga',
    'Upavistha Konasana': 'wide angle forward bend yoga',
    'Urdhva Dhanurasana': 'wheel pose yoga',
    'Urdhva Mukha Svsnssana': 'upward dog yoga',
    'Ustrasana': 'camel pose yoga',
    'Utkatasana': 'chair pose yoga',
    'Uttanasana': 'forward bend yoga',
    'Utthita Hasta Padangusthasana': 'standing leg extension yoga',
    'Utthita Parsvakonasana': 'extended side angle yoga',
    'Vasisthasana': 'side plank yoga',
    'Virabhadrasana One': 'warrior 1 yoga',
    'Virabhadrasana Three': 'warrior 3 yoga',
    'Virabhadrasana Two': 'warrior 2 yoga',
    'Vrksasana': 'tree pose yoga'
}

def download_image_from_pexels(pose_name, save_dir):
    """Download image from Pexels using their free API"""
    search_term = POSE_SEARCH_TERMS.get(pose_name, f"{pose_name} yoga")
    encoded_query = quote(search_term)
    
    # Pexels API (free tier, 200 requests/hour)
    # For production, get your own key at: https://www.pexels.com/api/
    # Using public endpoint for demo (limited)
    url = f"https://www.pexels.com/search/{encoded_query}/"
    
    try:
        # Use Unsplash Source for free random yoga images (no API key needed)
        # This is a simplified approach using their random image endpoint
        unsplash_url = f"https://source.unsplash.com/800x600/?{encoded_query}"
        
        print(f"Downloading: {pose_name}...")
        response = requests.get(unsplash_url, timeout=10)
        
        if response.status_code == 200:
            filename = pose_name.lower().replace(' ', '-') + '.jpg'
            filepath = os.path.join(save_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ Saved: {filename}")
            return True
        else:
            print(f"✗ Failed to download {pose_name}")
            return False
            
    except Exception as e:
        print(f"✗ Error downloading {pose_name}: {str(e)}")
        return False

def main():
    # Create poses directory
    save_directory = 'frontend/public/images/poses'
    os.makedirs(save_directory, exist_ok=True)
    
    print(f"Downloading {len(POSES)} yoga pose images...")
    print(f"Saving to: {save_directory}\n")
    
    successful = 0
    failed = 0
    
    for i, pose in enumerate(POSES, 1):
        print(f"[{i}/{len(POSES)}] ", end='')
        
        if download_image_from_pexels(pose, save_directory):
            successful += 1
        else:
            failed += 1
        
        # Be respectful with rate limits
        time.sleep(1)
    
    print(f"\n{'='*50}")
    print(f"Download complete!")
    print(f"✓ Successful: {successful}")
    print(f"✗ Failed: {failed}")
    print(f"{'='*50}")
    print(f"\nImages saved to: {os.path.abspath(save_directory)}")

if __name__ == '__main__':
    main()
