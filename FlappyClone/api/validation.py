
# NB: If these constants are updated, remember to update the JavaScript versions (in js/common/validation.js)!!
NUM_LEADERBOARD_ENTRIES = 10
MAX_NAME_LENGTH = 16
LEGAL_SYMBOLS = '-_'

# NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/common/validation.js)!
def isValidNameChar(c):
    if (c >= 'a' and c <= 'z'):
        return True
    elif (c >= 'A' and c <= 'Z'):
        return True
    elif (c >= '1' and c <= '9'):
        return True
    elif (LEGAL_SYMBOLS.find(c) != -1):
        return True
    else:
        return False

# NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/common/validation.js)!
def isValidName(name):
    reason = ''
    if (len(name) == 0):
        return (False, 'name is an empty string')
    elif (len(name) > MAX_NAME_LENGTH):
        return (False, 'name is too long (' + len(name) + ' characters, max is ' + MAX_NAME_LENGTH + ')')
    else:
        for c in name:
            if (not isValidNameChar(c)):
                return (False, 'name contains an invalid character (' + c + ')')
    return True
