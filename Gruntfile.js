
var BUILD_DIR = 'build';
var CLIENT_JS = BUILD_DIR + '/ts/client.js';

module.exports = function(grunt) {
    grunt.initConfig({
        typescript: {
            main: {
                src: ['src/**/*.ts', 'lib/*.d.ts'],
                dest: BUILD_DIR + '/ts/',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                }
            },
        },
        concat: {
            options: {
                separator: ';\n'
            },
            client: {
                src: [BUILD_DIR + '/ts/{model,client_common,local_client}.js'],
                dest: CLIENT_JS
            },
            server: {
                src: [BUILD_DIR + '/ts/model.js', BUILD_DIR + '/ts/manager.js'],
                dest: BUILD_DIR + '/ts/server.js'
            }
        },
        copy: {
            static: {
                src: ['static/*.*'],
                dest: BUILD_DIR + '/static/',
                expand: true,
                flatten: true,
            },
            client: {
                src: [CLIENT_JS],
                dest: BUILD_DIR + '/static/',
                expand: true,
                flatten: true,
            }
        },
        uglify: {
            client: {
                files: {
                    [BUILD_DIR + '/static/client.js']: CLIENT_JS,
                }
            }
        },
        watch: {
            client: {
                files: ['<%=  typescript.main.src %>'],
                tasks: ['typescript', 'concat:client', 'copy:client'],
            },
        }
    });
    
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Register tasks for default grunt build. This is set up for easier debugging
    grunt.registerTask('default', ['typescript',
                                    'concat:client',
                                    'concat:server',
                                    'copy:static',
                                    'copy:client']);

    // The dist task is for distribution. It performs minification of the 
    grunt.registerTask('dist', ['typescript',
                                'concat:client',
                                'concat:server',
                                'copy:static',
                                'uglify:client']);
};
