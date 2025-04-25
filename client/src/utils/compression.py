from PIL import Image, UnidentifiedImageError
import pillow_heif  # Import the HEIC plugin
import io
import os
import sys
import json

# Register HEIC support
pillow_heif.register_heif_opener()

def compress_image(input_path, output_path, max_size_kb=100):
    """
    Compress an image to be under a specified size while maintaining quality.
    
    Args:
        input_path (str): Path to the input image
        output_path (str): Path to save the compressed image
        max_size_kb (int): Maximum size in KB (default: 100KB)
    
    Returns:
        dict: Result containing success status and compression details
    """
    result = {
        "success": False,
        "error": None,
        "original_size": 0,
        "compressed_size": 0,
        "compression_ratio": 0
    }
    
    try:
        # Get original file size
        result["original_size"] = os.path.getsize(input_path)
        
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGB')
        
        quality = 85  # Start with high quality
        step = 5      # Decrease quality in steps if needed
        
        # First try quality reduction
        while quality > 10:
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb:
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                result["compressed_size"] = os.path.getsize(output_path)
                result["compression_ratio"] = (result["original_size"] - result["compressed_size"]) / result["original_size"]
                result["success"] = True
                return result
            quality -= step
        
        # If quality reduction isn't enough, try resizing
        while True:
            new_width = max(1, img.width // 2)
            new_height = max(1, img.height // 2)
            img = img.resize((new_width, new_height))
            
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=70, optimize=True)
            size_kb = buffer.tell() / 1024
            
            if size_kb <= max_size_kb or img.width < 10 or img.height < 10:
                with open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                result["compressed_size"] = os.path.getsize(output_path)
                result["compression_ratio"] = (result["original_size"] - result["compressed_size"]) / result["original_size"]
                result["success"] = True
                return result
                
    except UnidentifiedImageError:
        result["error"] = f"Error: {input_path} is not a valid image file."
    except FileNotFoundError:
        result["error"] = f"Error: File not found - {input_path}"
    except PermissionError:
        result["error"] = f"Error: Permission denied for file - {input_path}"
    except Exception as e:
        result["error"] = f"Error processing {input_path}: {str(e)}"
    
    return result

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python compression.py <input_path> <output_path>"
        }))
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    result = compress_image(input_path, output_path)
    print(json.dumps(result))


