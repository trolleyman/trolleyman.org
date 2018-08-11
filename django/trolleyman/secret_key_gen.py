"""
Pseudo-random django secret key generator.
"""

from __future__ import print_function

import string
import random
import os

KEY_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'keys/SECRET_KEY')

# If the SECRET_KEY file does not exist, generate it
if not os.path.isfile(KEY_FILE_PATH):
    # Get ascii Characters numbers and punctuation (minus quote characters as they could terminate string).
    chars = ''.join([string.ascii_letters, string.digits, string.punctuation]).replace('\'', '').replace('"', '').replace('\\', '')

    SECRET_KEY = ''.join([random.SystemRandom().choice(chars) for i in range(50)])

    with open(KEY_FILE_PATH, 'w') as f:
        f.write(SECRET_KEY);
