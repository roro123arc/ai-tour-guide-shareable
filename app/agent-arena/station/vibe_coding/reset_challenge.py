from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "original_yolo.py"
TARGET = ROOT / "challenge.py"


def main() -> None:
    TARGET.write_text(SOURCE.read_text(encoding="utf-8"), encoding="utf-8")
    print(f"Restored {TARGET.name} from {SOURCE.name}")


if __name__ == "__main__":
    main()
