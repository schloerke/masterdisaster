all: compile

#
# node
#

init: install-node install-node-modules

install-node:
	make/install-node

install-node-modules:
	make/install-node-modules

#
# app
#

compile:
	make/compile

run:
	bash -c '. env.sh && node forever-app.js'


#
# clean
#

clean:     clean-js
clean-all: clean-js clean-css clean-node clean-node-modules

clean-js:
	@rm -rfv static/js/_/

clean-node:
	@rm -rfv node/

clean-css:
	@rm -rfv static/style/_/*

clean-node-modules:
	@rm -rfv node_modules/
