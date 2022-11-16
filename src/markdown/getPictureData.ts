import { promises as fs } from "fs";
import { GetPictureData, PictureData } from "./extensions/typedefs";
import YAML from "yaml";

/*
Sample YML

elva-800w.jpg:
  "(max-width: 799px)": "elva-480w-close-portrait.jpg"
  "(min-width: 800px)": "elva-800w.jpg"

another-picture.png:
  "(max-width: 799px)": "another-picture-480w-recropped.png"
  "(min-width: 800px)": "another-picture.png.jpg"
*/

let allPictureData: Record<string, PictureData> = {};
export const loadPictureData = async (imageDataYamlPath: string): Promise<void> => {
  allPictureData = YAML.parse((await fs.readFile(imageDataYamlPath)).toString());
};

export const getPictureData: GetPictureData = (imgSrc: string): PictureData|undefined => allPictureData[imgSrc]
