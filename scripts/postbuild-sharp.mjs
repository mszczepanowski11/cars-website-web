// Nitro's dependency tracer copies sharp's own .node binary into .output/server/node_modules,
// but misses the separate @img/sharp-libvips-* package containing the shared library (.so) that
// binary dlopen's at the OS level (invisible to static import/require analysis). Without it,
// sharp throws "cannot open shared object file: libvips-cpp.so" at runtime even though the
// build itself succeeds. Copy it in directly rather than fight the tracer's config for this.
import { cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const LIBVIPS_PACKAGES = ['sharp-libvips-linux-x64', 'sharp-libvips-linuxmusl-x64']

const srcRoot = join(process.cwd(), 'node_modules', '@img')
const destRoot = join(process.cwd(), '.output', 'server', 'node_modules', '@img')

if (!existsSync(destRoot)) {
    console.log('[postbuild-sharp] .output/server/node_modules/@img not found - skipping (sharp not traced into this build?)')
    process.exit(0)
}

for (const pkg of LIBVIPS_PACKAGES) {
    const src = join(srcRoot, pkg)
    const dest = join(destRoot, pkg)
    if (existsSync(src)) {
        cpSync(src, dest, { recursive: true })
        console.log(`[postbuild-sharp] copied ${pkg}`)
    } else {
        console.log(`[postbuild-sharp] ${pkg} not installed in this environment - skipped`)
    }
}
