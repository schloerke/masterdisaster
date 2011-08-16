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

#
# clean
#

clean:     clean-js
clean-all: clean-js clean-node clean-node-modules

clean-js:
	@rm -rfv static/js/_/

clean-node:
	@rm -rfv node/

clean-node-modules:
	@rm -rfv node_modules/
