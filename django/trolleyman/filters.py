from shutil import which
import subprocess
from tempfile import NamedTemporaryFile

from django.core.exceptions import ImproperlyConfigured

from compressor.filters import CompilerFilter


class TypescriptFilter(CompilerFilter):
    command = "tsc --outFile {outfile} {infile}"
    
    def __init__(self, *args, **kwargs):
        super(TypescriptFilter, self).__init__(, *args, **kwargs)
        if which('tsc') is None:
            raise ImproperlyConfigured("TypeScript compiler isn't installed (`tsc` is not on the path)")

    def input(self, **kwargs):
        self.infile = NamedTemporaryFile(mode='wb', suffix='.ts')
        self.infile.write(self.content.encode(encoding))
        self.infile.flush()
        self.options["infile"] = self.infile.name

        return super(TypescriptFilter, self).input(**kwargs)

"""
    command = None
    options = ()
    default_encoding = (
        settings.FILE_CHARSET if settings.is_overridden('FILE_CHARSET') else
        'utf-8'
    )

    def __init__(self, content, command=None, **kwargs):
        super(CompilerFilter, self).__init__(content, **kwargs)
        self.cwd = None

        if command:
            self.command = command
        if self.command is None:
            raise FilterError("Required attribute 'command' not given")

        if isinstance(self.options, dict):
            # turn dict into a tuple
            new_options = ()
            for item in self.options.items():
                new_options += (item,)
            self.options = new_options

        # append kwargs to self.options
        for item in kwargs.items():
            self.options += (item,)

        self.stdout = self.stdin = self.stderr = subprocess.PIPE
        self.infile = self.outfile = None

    def input(self, **kwargs):
        if self.infile is None and "{infile}" in self.command:
            # create temporary input file if needed
            if self.filename is None:
                self.infile = NamedTemporaryFile(mode='wb')
                self.infile.write(self.content.encode(encoding))
                self.infile.flush()
                options["infile"] = self.infile.name
            else:
                # we use source file directly, which may be encoded using
                # something different than utf8. If that's the case file will
                # be included with charset="something" html attribute and
                # charset will be available as filter's charset attribute
                encoding = self.charset  # or self.default_encoding
                self.infile = open(self.filename)
                options["infile"] = self.filename

        if "{outfile}" in self.command and "outfile" not in options:
            # create temporary output file if needed
            ext = self.type and ".%s" % self.type or ""
            self.outfile = NamedTemporaryFile(mode='r+', suffix=ext)
            options["outfile"] = self.outfile.name

        # Quote infile and outfile for spaces etc.
        if "infile" in options:
            options["infile"] = shell_quote(options["infile"])
        if "outfile" in options:
            options["outfile"] = shell_quote(options["outfile"])

        try:
            command = self.command.format(**options)
            proc = subprocess.Popen(
                command, shell=True, cwd=self.cwd, stdout=self.stdout,
                stdin=self.stdin, stderr=self.stderr)
            if self.infile is None:
                # if infile is None then send content to process' stdin
                filtered, err = proc.communicate(
                    self.content.encode(encoding))
            else:
                filtered, err = proc.communicate()
            filtered, err = filtered.decode(encoding), err.decode(encoding)
        except (IOError, OSError) as e:
            raise FilterError('Unable to apply %s (%r): %s' %
                              (self.__class__.__name__, self.command, e))
        else:
            if proc.wait() != 0:
                # command failed, raise FilterError exception
                if not err:
                    err = ('Unable to apply %s (%s)' %
                           (self.__class__.__name__, self.command))
                    if filtered:
                        err += '\n%s' % filtered
                raise FilterError(err)

            if self.verbose:
                self.logger.debug(err)

            outfile_path = options.get('outfile')
            if outfile_path:
                with io.open(outfile_path, 'r', encoding=encoding) as file:
                    filtered = file.read()
        finally:
            if self.infile is not None:
                self.infile.close()
            if self.outfile is not None:
                self.outfile.close()
        return smart_text(filtered)
"""
