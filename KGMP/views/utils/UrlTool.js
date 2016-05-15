

module.exports = {
    getUrlForImage(imgName) {
        var rootUrl = window.isSimulator 
                ? 
            'http://localhost/kgmp_images' 
                : 
            'http://djliquidice.com/gr/kgmp_images';


        return `${rootUrl}/${imgName}.png`
    }
}