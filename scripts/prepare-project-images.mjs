import {readFileSync,mkdirSync,copyFileSync,existsSync,statSync} from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(readFileSync('lib/projectImageSources.json','utf8'));
mkdirSync('public/projects',{recursive:true});
mkdirSync('artwork/projects',{recursive:true});
for(const {id,source}of manifest){
 const original='artwork/projects/'+id+'-v1.png';
 if(!existsSync(original))copyFileSync(source,original);
 await sharp(original).resize({width:1280,withoutEnlargement:true}).webp({quality:86,effort:5}).toFile('public/projects/'+id+'-v1.webp');
 console.log(id+': '+Math.round(statSync('public/projects/'+id+'-v1.webp').size/1024)+' KB');
}
