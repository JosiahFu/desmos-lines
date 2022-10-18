# desmos-lines

This code converts a series of points in desmos to equations that connect those points.

1. Set up your Desmos graph so that between each pair of points is a comment with one of the following:
    - Linear
    - Quadratic
    - Cubic

> Add -i to make the graph inverted (e.g. x=y^2)  
> Add -o to use point 2 as the locator instead of point 1

2. Install the [Desmodder](https://chrome.google.com/webstore/detail/desmodder-for-desmos/eclmfdfimjhkmjglgdldedokjaemjfjp) extension ([Firefox](https://addons.mozilla.org/en-US/firefox/addon/desmodder-for-desmos/))
3. Enable the Text Mode plugin and activate it
4. Copy and paste your points and comments into `points.txt`
5. Run `ts-node src/index.ts`