# Installation:
Put Gulpfile.js and package.json one level higher in directory structure than your project is.

    npm install -g gulp
    npm install

# Conf:
By default port 3000 is used. To conf separate ports for each project, create gulp_conf.json, with the following structure:

    {
        "ports": {
            "project_dir_1": 3001,
            "project_dir_2": 3002,
            "project_dir_3": 3003
        }
    } 

# Usage:

    gulp --cwd <project_dir>

# Other commands:
Lint:

    gulp lint

Coffee lint:
    
    gulp coffeelint

CSS lint:

    gulp csslint    

Watch without server:    

    gulp watch

Just the server:

    gulp server

Dev build:

    gulp build-dev

CSS only build:

    gulp css

# TODO:

- Production build
- Cordova builds