import canvas from 'canvas';
import fs from 'fs';


const screenheight = 768;
const screenwidth = 1366;
const widthlimit = 600;
const heightlimit = 600;
const cvs = canvas.createCanvas(screenwidth, screenheight, "png");
const context = cvs.getContext('2d');
const resizewidth = 600;
const resizeheight = 600;

function getcommoncolor(imgData, filename) {
    var colors = [];
    var numberofcolors = [];
    const imglength = imgData.data.length;
    let intervalone = (imglength / 4) * 1;
    let intervaltwo = (imglength / 4) * 2;
    let intervalthree = (imglength / 4) * 3;
    let intervalfour = (imglength / 4) * 4;
    for (i = 0; i < imglength; i += 4) {
        switch (i) {
            case intervalone:
                console.log(`${filename}: [██......]`);
                break;
            case intervaltwo:
                console.log(`${filename}: [████....]`);
                break;
            case intervalthree:
                console.log(`${filename}: [██████..]`);
                break;
            case intervalfour:
                console.log(`${filename}: [████████]`);
                break;
        }
        let pixelcolor = [
            imgData.data[i],
            imgData.data[i + 1],
            imgData.data[i + 2]
        ];
        let found = false;
        let index;
        for (var k = 0; k < colors.length; k++) {
            if (colors[k][0] == pixelcolor[0] && colors[k][1] == pixelcolor[1] && colors[k][2] == pixelcolor[2]) {
                found = true;
                index = k;
            }
        }
        if (found) {
            //has color
            numberofcolors[index] = ++numberofcolors[index];
        } else {
            colors.push(pixelcolor);
            numberofcolors.push(1);
        }
    }
    let highest = 0;
    let highestindex = 0;
    for (var i = 0; i < numberofcolors.length; i++) {
        if (numberofcolors[i] > highest) {
            highestindex = i;
            highest = numberofcolors[i];
        }
    }
    return colors[highestindex];
}
var failed = [];
const offset = 40;
var diditfail = false;
fs.readdir("./Intakefolder", function(err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    };
    for (let i = 0; i < files.length; i++) {
        canvas.loadImage(`./Intakefolder/${files[i]}`).then(image => {
            let imgwidth = image.width;
            let imgheight = image.height;
            if (imgwidth <= widthlimit || imgheight <= heightlimit) {
                diditfail = true;
                failed.push(`${files[i]}`);
                if (i + 1 == files.length) {
                    fs.writeFileSync(`Result/failed/failedones.txt`, failed);
                }
                return;
            }
            context.drawImage(image, 0, 0, resizewidth, resizeheight);
            let colorstochoose = getcommoncolor(context.getImageData(0, 0, resizewidth, resizeheight), files[i]);
            console.log(`Progress: ${i+1}/${files.length} - ${(i+1)/files.length * 100}%`);
            context.fillStyle = `rgb(${colorstochoose[0]},${colorstochoose[1]},${colorstochoose[2]})`;
            context.fillRect(0, 0, screenwidth, screenheight);
            let chamger = (screenheight - offset) / imgheight;
            let newwidth = imgwidth * chamger;
            let newheight = screenheight - offset;
            context.drawImage(image, (screenwidth - newwidth) / 2, 0, newwidth, newheight);
            const buffer = cvs.toBuffer('image/png');
            fs.writeFileSync(`Result/sucess/new${files[i]}`, buffer);
        });
    }
});