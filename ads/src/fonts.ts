import { loadFont as loadDisplay } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadSans } from "@remotion/google-fonts/HankenGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const subsets = ["latin"];

export const display = loadDisplay("normal", { weights: ["600", "700", "800"], subsets }).fontFamily;
export const sans = loadSans("normal", { weights: ["400", "600", "700"], subsets }).fontFamily;
export const mono = loadMono("normal", { weights: ["600", "700"], subsets }).fontFamily;
