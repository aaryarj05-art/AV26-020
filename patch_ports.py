import os
import glob

def replace_in_files(directory, ext, old_str, new_str):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(ext):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                if old_str in content:
                    content = content.replace(old_str, new_str)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"Updated {path}")

def main():
    print("Patching ports 8000 -> 8080 and 8001 -> 8081...")
    
    # 1. Update test_system.py
    replace_in_files(".", ".py", "127.0.0.1:8080", "127.0.0.1:8080")
    replace_in_files(".", ".py", "127.0.0.1:8081", "127.0.0.1:8081")
    replace_in_files(".", ".py", "port=8080", "port=8080")
    replace_in_files(".", ".py", "port=8081", "port=8081")

    # 2. Update frontend
    replace_in_files("frontend/src", ".ts", "localhost:8000", "localhost:8080")
    replace_in_files("frontend/src", ".ts", "127.0.0.1:8080", "127.0.0.1:8080")
    replace_in_files("frontend/src", ".tsx", "localhost:8000", "localhost:8080")
    replace_in_files("frontend/src", ".tsx", "127.0.0.1:8080", "127.0.0.1:8080")
    
    # 3. Update proxy in frontend/vite.config.ts (if exists)
    replace_in_files("frontend", ".ts", "target: 'http://127.0.0.1:8080'", "target: 'http://127.0.0.1:8080'")
    replace_in_files("frontend", ".ts", "target: 'http://localhost:8000'", "target: 'http://localhost:8080'")
    
    print("Done! You can now start the servers on ports 8080 and 8081.")

if __name__ == "__main__":
    main()
