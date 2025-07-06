BUILD_DIR:=../build
ESM_PP:=../source/bin/esm-pp

VERSION:=$(shell jq -r .version ../source/package.json)
NAME:=$(shell jq -r .name ../source/package.json)

LATEST:=$(BUILD_DIR)/$(NAME)-$(VERSION).tgz

latest-package: $(LATEST)

arch-latest: $(LATEST)
	@# Future command doesn't need --style since .ml will be recognized
	mkdir -p $(BUILD_DIR)/arch/latest
	$(ESM_PP) -I include --style ml arch_linux/PKGBUILD-latest.ml -o $(BUILD_DIR)/arch/latest/PKGBUILD


$(LATEST):
	mkdir -p $(BUILD_DIR)
	cd $(BUILD_DIR) && \
		npm pack ../source

.PHONY: arch-latest latest-package