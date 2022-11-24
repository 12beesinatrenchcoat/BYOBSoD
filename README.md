# BYOBSoD
> Bring Your Own Blue Screen of Death

![GitHub last commit](https://img.shields.io/github/last-commit/12beesinatrenchcoat/BYOBSoD?style=flat-square)
[![XO code style](https://flat.badgen.net/badge/code%20style/XO-ish/cyan)](.eslintrc.json)

Put a fake Windows 10-ish BSOD on your screen. Because why not.

![Example Green Screen of Death. "D: / something super duper bad happened / 0% complete / like really really super extremely super duper bad super bad it's not good it's bad / If you call a support person, give them this info: / Stop code: computer exploded](images/gsod.png)

## Developing
Install dependencies, run the `dev` script. `build` to build.


## Why does this exist?
I needed a recordable Blue Screen of Death on my screen, but I couldn't find anything accurate enough. Some BSOD generators I found had grammatical errors or were outdated. I didn't want to use images, as they wouldn't have an updating progress percentage. Manually triggered BSODs also have a "MANUALLY_TRIGGERED" stop code.

So I made this instead. For a three second gag.

Worth.

### How accurate is it?
I tried to get things as accurate as possible, with an overlaid image. Tested in Firefox, experience in other browsers may vary. Kerning is a bit off, vertical spacing isn't perfect.
It also looks like Windows 11's BSOD has different vertical spacing around the QR code.
Overlaid image of BSOD on top of this below.

![Comparison image of BYOBSoD and actual BSOD](images/comparison.png)

## License
[MIT License](./LICENSE.txt).
