#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// ESMでの__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("SVGからPNGへの変換を開始します...");

try {
  // まず、必要なパッケージがインストールされているか確認
  console.log("必要なパッケージをインストールしています...");
  execSync("npm install sharp --save-dev", { stdio: "inherit" });

  // このスクリプトをDynamicImportで実行
  const convertScript = `
  const fs = require('fs');
  const path = require('path');
  const sharp = require('sharp');
  
  async function convertSvgToPng() {
    const imagesDir = path.join(process.cwd(), 'assets', 'images');
    
    // ライトモード用アイコン
    const svgPath = path.join(imagesDir, 'bookclip-splash-icon.svg');
    const pngPath = path.join(imagesDir, 'splash-icon.png');
    
    // ダークモード用アイコン
    const darkSvgPath = path.join(imagesDir, 'bookclip-splash-icon-dark.svg');
    const darkPngPath = path.join(imagesDir, 'splash-icon-dark.png');
    
    if (fs.existsSync(svgPath)) {
      console.log('ライトモードアイコンを変換中...');
      await sharp(svgPath)
        .resize(200, 200)
        .png()
        .toFile(pngPath);
      console.log('ライトモードアイコンの変換が完了しました');
    } else {
      console.error('SVGファイルが見つかりません:', svgPath);
    }
    
    if (fs.existsSync(darkSvgPath)) {
      console.log('ダークモードアイコンを変換中...');
      await sharp(darkSvgPath)
        .resize(200, 200)
        .png()
        .toFile(darkPngPath);
      console.log('ダークモードアイコンの変換が完了しました');
    } else {
      console.error('ダークモード用SVGファイルが見つかりません:', darkSvgPath);
    }
  }
  
  convertSvgToPng().catch(err => {
    console.error('変換中にエラーが発生しました:', err);
    process.exit(1);
  });
  `;

  // 一時スクリプトファイルに書き込む
  const tempScriptPath = path.join(__dirname, "temp-convert-script.cjs");
  fs.writeFileSync(tempScriptPath, convertScript);

  // スクリプトを実行
  console.log("変換スクリプトを実行しています...");
  execSync(`node ${tempScriptPath}`, { stdio: "inherit" });

  // 一時ファイルを削除
  fs.unlinkSync(tempScriptPath);

  console.log("変換が正常に完了しました！");
} catch (error) {
  console.error("エラーが発生しました:", error);
}
