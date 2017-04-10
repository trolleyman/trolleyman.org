"""
Pseudo-random django secret key generator.
- Does print SECRET key to terminal which can be seen as unsafe.
"""

from __future__ import print_function

import string
import random
import os

# Get ascii Characters numbers and punctuation (minus quote characters as they could terminate string).
chars = ''.join([string.ascii_letters, string.digits, string.punctuation]).replace('\'', '').replace('"', '').replace('\\', '')

SECRET_KEY = ''.join([random.SystemRandom().choice(chars) for i in range(50)])

with open(os.path.join(os.path.dirname(__file__), 'SECRET_KEY'), 'w') as f:
    f.write(SECRET_KEY);
