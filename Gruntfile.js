'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        project: {
            app: require('./bower.json').appPath || 'app',
            dist: 'dist'
        },

        watch: {
            js: {
                files: ['<%= project.app %>/js/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
            less: {
                files: ['<%= project.app %>/less/{,*/}*.less'],
                tasks: ['less:dist']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= project.app %>/{,partials/}{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= project.app %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        replace: {
            default: {
                src: ['<%= project.dist %>/scripts/*.js'],
                overwrite: true,
                replacements: [{
                    from: 'localhost:9000',
                    to: grunt.option('api') || 'api.shace.io'
                }]
            },
        },

        coveralls: {
            options: {
                debug: true,
                coverage_dir: 'coverage',
                force: true
            }
        },

        connect: {
            options: {
                port: 8000,
                hostname: '*',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= project.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 8001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= project.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= project.dist %>'
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= project.app %>/js/{,*/}*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        less: {
            dist: {
                options: {
                    path: '<%= project.app %>/less/{,*/}*.less',
                    compile: true,
                    cleancss: true,
                },

                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/less',
                    src: '{,*/}*.less',
                    dest: '.tmp/styles/',
                    ext: '.css'
                }]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= project.dist %>/*',
                        '!<%= project.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        wiredep: {
            target: {
                src: ['<%= project.app %>/{,partials/}{,*/}*.html'],
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= project.dist %>/scripts/{,*/}*.js',
                        '<%= project.dist %>/styles/{,*/}*.css',
                        '<%= project.dist %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= project.dist %>/styles/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= project.app %>/{,partials/}{,*/}*.html',
            options: {
                dest: '<%= project.dist %>'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= project.dist %>/{,partials/}{,*/}*.html'],
            css: ['<%= project.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= project.dist %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/img',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= project.dist %>/img'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= project.app %>/img',
                    src: '{,*/}*.svg',
                    dest: '<%= project.dist %>/img'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.dist %>',
                    src: ['*.html', 'partials/{,*/}*.html'],
                    dest: '<%= project.dist %>'
                }]
            }
        },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= project.app %>',
                    dest: '<%= project.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'partials/{,*/}*.html',
                        'bower_components/**/*',
                        'img/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/img',
                    dest: '<%= project.dist %>/img',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= project.app %>/less',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less'
            ],
            test: [
                'less'
            ],
            dist: [
                'less',
                'imagemin',
                'svgmin'
            ]
        },

        karma: {
            default: {
                configFile: 'config/karma.conf.js',
                singleRun: true
            },
            travis: {
                configFile: 'config/karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            },
            coverall: {
                configFile: 'config/karma.coveralls.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma:default'
    ]);

    grunt.registerTask('testTravis', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma:travis'
    ]);

    grunt.registerTask('cover', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma:coverall'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngmin',
        'copy:dist',
        'cssmin',
        'uglify',
        'rev',
        'usemin',
        'replace',
        'htmlmin'
    ]);

    grunt.registerTask('heroku:production', [
        'build',
    ]);

    grunt.registerTask('travis', [
        //'newer:jshint',
        'testTravis',
        'karma:coverall',
        'build'
    ]);

    grunt.registerTask('default', [
        //'newer:jshint',
        'test',
        'build'
    ]);
};
