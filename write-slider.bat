@echo off
(
echo 'use client';
echo.
echo import { useState } from 'react';
echo import { Building2 } from 'lucide-react';
echo.
echo export function SingleCoverSlider^(^) {
echo   return ^(
echo     ^<section className="py-16 px-4 bg-white"^>
echo       ^<div className="max-w-7xl mx-auto"^>
echo         ^<h2 className="text-4xl font-bold text-center"^>Single Cover Options^</h2^>
echo       ^</div^>
echo     ^</section^>
echo   ^);
echo }
) > "apps\frontend\src\components\landing-page\SingleCoverSlider.tsx"
