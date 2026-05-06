{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
    # Uncomment the lines below to enable Playwright-driven live GNMA
    # downloads. Without these system packages the `--skip-download`
    # path still works (and is the recommended Replit workflow — upload
    # gnma_mf_raw_data.parquet manually to the repo root).
    #
    # pkgs.firefox-esr
    # pkgs.chromium
    # pkgs.nss
    # pkgs.libgbm
    # pkgs.ffmpeg
  ];
}
