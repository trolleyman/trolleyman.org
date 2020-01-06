from shutil import which
import subprocess
from tempfile import NamedTemporaryFile

from django.core.exceptions import ImproperlyConfigured

from compressor.filters import CompilerFilter


class TypescriptFilter(CompilerFilter):
    command = "tsc --outFile {outfile} {infile}"
    
    def __init__(self, *args, **kwargs):
        super(TypescriptFilter, self).__init__(*args, **kwargs)
        print(self.__dict__)
        if which('tsc') is None:
            raise ImproperlyConfigured("TypeScript compiler isn't installed (`tsc` is not on the path)")

    def input(self, **kwargs):
        self.infile = NamedTemporaryFile(mode='wb', suffix='.ts')
        self.infile.write(self.content.encode(self.default_encoding))
        self.infile.flush()

        self.options = dict(self.options)
        self.options["infile"] = self.infile.name

        return super(TypescriptFilter, self).input(**kwargs)
