from shutil import which
import subprocess
from tempfile import NamedTemporaryFile

from django.core.exceptions import ImproperlyConfigured
from django.conf import settings

from compressor.filters import CompilerFilter


class TypescriptFilter(CompilerFilter):
    def __init__(self, *args, **kwargs):
        self.command = "tsc --module amd --outFile {outfile} {infile}"
        if settings.DEBUG:
            self.command += ' --inlineSourceMap --inlineSources'
            #self.command += ' -sourcemap'

        super(TypescriptFilter, self).__init__(*args, **kwargs)
        if which('tsc') is None:
            raise ImproperlyConfigured("TypeScript compiler isn't installed (`tsc` is not on the path)")

    def input(self, **kwargs):
        self.infile = NamedTemporaryFile(mode='wb', suffix='.ts')
        self.infile.write(self.content.encode(self.default_encoding))
        self.infile.flush()

        self.options = dict(self.options)
        self.options["infile"] = self.infile.name

        return super(TypescriptFilter, self).input(**kwargs)
