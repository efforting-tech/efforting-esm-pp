BUILD_DIR:=../build

#Note - this should not depend on our current library since it may not be runnable (have its modules installed)
#	it should instead just call esm-pp which will be assumed to be available (and could be an older version - we will specify a minimum build dep later on)
ESM_PP:=../source/bin/esm-pp


VERSION:=$(shell jq -r .version ../source/package.json)
NAME:=$(shell jq -r .name ../source/package.json)
RELEASE_FILE:=$(NAME)-$(VERSION).tgz
LATEST:=$(BUILD_DIR)/$(RELEASE_FILE)

release: arch-latest
	@if [ -z "$(RELEASE_NOTES)" ]; then echo "RELEASE_NOTES is not set"; exit 1; fi
	git tag v$(VERSION)
	gh release create v$(VERSION) --title "version $(VERSION)" --notes "$(RELEASE_NOTES)"
	gh release upload v$(VERSION) $(RELEASE_FILE)


latest-package: $(LATEST)

arch-latest: $(BUILD_DIR)/arch/latest/PKGBUILD

$(BUILD_DIR)/arch-latest.tgz: $(BUILD_DIR)/arch/latest/PKGBUILD
	tar -czf $@ -C $(BUILD_DIR)/arch/latest ./

$(BUILD_DIR)/arch/latest/PKGBUILD: arch_linux/PKGBUILD-latest.ml $(LATEST)
	@# Future command doesn't need --style since .ml will be recognized
	mkdir -p $(BUILD_DIR)/arch/latest
	$(ESM_PP) -I include --style ml $< -o $(BUILD_DIR)/arch/latest/PKGBUILD

$(LATEST):
	mkdir -p $(BUILD_DIR)
	cd $(BUILD_DIR) && \
		npm pack ../source

clean:
	@if [ -n "$(BUILD_DIR)" ]; then rm -rf "$(BUILD_DIR)"; else echo "BUILD_DIR is not set"; exit 1; fi


.PHONY: arch-latest latest-package clean release