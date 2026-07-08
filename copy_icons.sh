#!/bin/bash
BRAIN_DIR="/Users/jigarsolanki/.gemini/antigravity-ide/brain/4cb24a5b-c89c-4593-91ef-d7517ca08e75"
IOS_DIR="ios/ReactNativeStarter"
RES_DIR="android/app/src/main/res"

ICONS=(
  "premium_icon:premium"
  "dark_icon:dark"
  "gold_icon:gold"
  "holiday_icon:holiday"
  "christmas_icon:christmas"
  "diwali_icon:diwali"
)

# Create mipmap folders if they don't exist
mkdir -p "$RES_DIR/mipmap-mdpi" "$RES_DIR/mipmap-hdpi" "$RES_DIR/mipmap-xhdpi" "$RES_DIR/mipmap-xxhdpi" "$RES_DIR/mipmap-xxxhdpi"

for ICON_MAP in "${ICONS[@]}"; do
  KEY="${ICON_MAP%%:*}"
  NAME="${ICON_MAP##*:}"
  
  # Find the generated png file
  FILE=$(ls "$BRAIN_DIR"/${KEY}_*.png 2>/dev/null | head -n 1)
  
  if [ -f "$FILE" ]; then
    echo "Processing $NAME from $FILE"
    
    # iOS - just copy directly as 1024x1024
    cp "$FILE" "$IOS_DIR/${NAME}.png"
    
    # Android sizes
    # mdpi (48x48)
    sips -z 48 48 "$FILE" --out "$RES_DIR/mipmap-mdpi/ic_launcher_${NAME}.png" > /dev/null
    sips -z 48 48 "$FILE" --out "$RES_DIR/mipmap-mdpi/ic_launcher_${NAME}_round.png" > /dev/null
    # hdpi (72x72)
    sips -z 72 72 "$FILE" --out "$RES_DIR/mipmap-hdpi/ic_launcher_${NAME}.png" > /dev/null
    sips -z 72 72 "$FILE" --out "$RES_DIR/mipmap-hdpi/ic_launcher_${NAME}_round.png" > /dev/null
    # xhdpi (96x96)
    sips -z 96 96 "$FILE" --out "$RES_DIR/mipmap-xhdpi/ic_launcher_${NAME}.png" > /dev/null
    sips -z 96 96 "$FILE" --out "$RES_DIR/mipmap-xhdpi/ic_launcher_${NAME}_round.png" > /dev/null
    # xxhdpi (144x144)
    sips -z 144 144 "$FILE" --out "$RES_DIR/mipmap-xxhdpi/ic_launcher_${NAME}.png" > /dev/null
    sips -z 144 144 "$FILE" --out "$RES_DIR/mipmap-xxhdpi/ic_launcher_${NAME}_round.png" > /dev/null
    # xxxhdpi (192x192)
    sips -z 192 192 "$FILE" --out "$RES_DIR/mipmap-xxxhdpi/ic_launcher_${NAME}.png" > /dev/null
    sips -z 192 192 "$FILE" --out "$RES_DIR/mipmap-xxxhdpi/ic_launcher_${NAME}_round.png" > /dev/null
  else
    echo "Warning: File for $KEY not found."
  fi
done
