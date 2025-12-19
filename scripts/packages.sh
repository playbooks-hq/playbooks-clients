echo "running packages...\n"

npm install \
@playbooks/normalizers@latest \
@playbooks/serializers@latest \
@playbooks/utils@latest

npm install @playbooks/configs@latest --save-dev