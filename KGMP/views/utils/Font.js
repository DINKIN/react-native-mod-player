const fontUtilWidth = require('Dimensions').get('window').width,
      viewPortSize = fontUtilWidth > 320 ? 'large' : fontUtilWidth > 260 ? 'medium' : 'small';

function decreaseFont(orig, size) {
    let viewPortIsSmall = viewPortSize === 'small';

    switch (size) {
        case 'large':
            return orig - (viewPortIsSmall ? 10 : 6);
        case 'medium':
            return orig - (viewPortIsSmall ? 6 : 4);
        case 'small':
            return orig - (viewPortIsSmall ? 4 : 2);
        case 'xsmall':
            return orig - (viewPortIsSmall ? 2 : 1);
    }
}

module.exports = {
    getAppropriateFontSize: function (originalFontSize) {
        if (viewPortSize === 'large') {
            return originalFontSize;
        }

        switch (true) {
            case (originalFontSize >= 30):
                return decreaseFont(originalFontSize, 'large');
            case (originalFontSize >= 16):
                return decreaseFont(originalFontSize, 'medium');
            case (originalFontSize >= 8):
                return decreaseFont(originalFontSize, 'small');
            default:
                return decreaseFont(originalFontSize, 'xsmall');
        }
    }
};
