{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    git
    wabt
    nixpkgs-fmt
    (vscode-with-extensions.override {
      vscode = pkgs.vscode;
      vscodeExtensions = with pkgs.vscode-extensions; [
        jnoortheen.nix-ide
        mhutchie.git-graph
        github.github-vscode-theme
        esbenp.prettier-vscode
        dbaeumer.vscode-eslint
      ]; /*++ pkgs.vscode-utils.extensionsFromVscodeMarketplace [
        {
          name = "vscode-antlr4";
          publisher = "mike-lischke";
          version = "2.4.6";
          sha256 = "1cb1i3x783mljnykccqzhyb4aj2yzz77cy20ri4hxky1wmgmvfc7";
        }
      ];*/
    })
  ];

  shellHook = ''
    echo "Welcome to the dev shell!"
  '';
}
