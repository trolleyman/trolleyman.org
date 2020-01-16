from shutil import which
import subprocess
import os
from tempfile import NamedTemporaryFile, TemporaryDirectory

from django.core.exceptions import ImproperlyConfigured
from django.conf import settings

from compressor.filters import CompilerFilter


class TypescriptFilter(CompilerFilter):
    def __init__(self, *args, **kwargs):
        self.command = "tsc --module amd --outFile {outfile} {infile}"

        super(TypescriptFilter, self).__init__(*args, **kwargs)
        if which('tsc') is None:
            raise ImproperlyConfigured("TypeScript compiler isn't installed (`tsc` is not on the path)")

    def input(self, **kwargs):
        self.options = dict(self.options)
        src = self.options['attrs']['src']

        if settings.DEBUG:
            self.command += ' --inlineSourceMap --sourceRoot {}'.format(os.path.dirname(src))

        directory = TemporaryDirectory(prefix='django-compressor-typescript-')
        try:
            self.infile = open(os.path.join(directory.name, os.path.basename(src)), 'wb')
            self.options["infile"] = self.infile.name
            self.infile.write(self.content.encode(self.default_encoding))
            self.infile.flush()

            return super(TypescriptFilter, self).input(**kwargs)
        finally:
            directory.cleanup()
