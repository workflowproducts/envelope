var WS = {};
var binaryArray = new Uint8Array([249,76,66,226,115,113,70,165,80,182,156,183,140,36,78,228,233,111,62,10,145,209,80,226,211,137,195,199,31,36,28,203,18,91,105,202,100,228,104,44,85,213,96,38,140,112,132,228,210,81,79,37,75,205,191,249,82,122,98,62,131,36,186,85,44,30,195,173,172,85,202,188,211,150,37,250,100,103,63,130,126,165,150,133,235,125,93,54,82,57,139,191,12,138,235,91,82,44,40,13,241,230,138,165,194,68,42,23,64,18,22,150,106,54,193,37,24,222,188,29,214,221,227,140,83,145,218,194,78,26,253,249,39,155,241,116,139,62,52,173,105,49,76,31,239,213,133,223,236,102,185,85,161,139,132,155,71,84,41,20,110,207,216,40,80,232,56,94,154,132,81,137,69,101,250,224,66,20,15,61,248,75,77,196,39,148,11,80,149,130,181,25,191,70,197,157,182,131,247,11,13,199,13,110,114,196,195,78,174,74,81,101,215,216,33,208,18,80,252,30,69,100,45,80,7,52,35,172,21,227,214,148,176,60,46,214,58,159,130,186,253,133,243,65,182,213,41,93,25,60,66,120,22,89,106,193,200,73,79,103,77,181,46,3,34,178,81,36,158,89,55,17,69,213,101,148,146,244,200,48,78,85,214,103,233,153,74,8,133,198,3,199,43,131,193,85,127,149,243,123,181,55,139,125,13,69,231,26,85,14,183,24,8,177,16,244,102,120,86,154,134,141,201,5,33,21,69,29,121,201,200,162,253,13,120,43,172,23,131,195,131,1,97,188,139,36,129,137,242,164,86,93,9,208,252,152,185,197,166,126,2,90,47,24,29,68,222,49,208,7,218,231,2,140,200,252,98,93,29,121,227,137,65,37,125,249,39,19,228,48,210,150,16,59,148,48,61,128,107,93,17,131,173,48,246,160,156,11,222,153,1,79,216,13,123,22,21,30,245,227,155,230,211,178,40,167,67,161,171,231,108,36,30,181,208,97,145,153,219,161,108,180,144,172,168,145,114,42,25,237,158,4,81,124,63,243,145,167,83,210,208,197,147,81,167,178,33,145,184,171,214,222,48,220,221,87,172,185,161,82,79,19,111,227,137,134,111,104,166,135,28,107,32,121,208,174,39,119,52,37,56,21,235,20,196,225,135,189,221,150,180,26,31,8,242,37,153,65,242,29,208,5,96,159,116,55,218,29,233,180,127,113,58,146,10,221,60,190,78,210,144,164,75,84,212,184,98,18,172,13,178,100,23,30,127,150,19,55,9,80,112,82,218,161,130,68,15,57,104,147,223,174,81,141,37,245,83,32,202,8,125,165,196,126,143,121,60,132,59,55,144,87,110,183,1,187,209,38,111,25,104,43,6,104,115,49,221,104,131,79,196,222,18,225,2,137,5,124,220,175,87,130,195,167,192,247,182,117,188,224,28,4,72,100,172,23,173,141,159,152,54,136,78,174,144,136,158,168,121,44,199,237,62,111,233,87,43,11,161,215,48,230,173,223,27,227,137,44,237,144,148,207,78,169,37,250,47,158,91,10,242,120,200,168,201,130,126,166,86,36,8,73,193,179,99,41,44,69,89,180,189,169,92,209,148,198,227,27,207,179,170,75,63,1,56,123,201,36,135,217,54,128,216,77,100,58,151,42,214,32,237,129,251,201,115,46,203,252,59,49,188,14,167,134,114,173,37,206,110,39,98,152,39,228,212,66,160,52,33,170,189,211,203,97,253,22,199,244,103,37,164,65,6,230,164,135,125,32,141,144,124,143,166,63,84,65,6,45,0,173,106,21,140,174,250,82,18,36,233,124,209,141,148,121,203,80,234,102,149,15,75,160,208,211,235,133,46,17,56,95,21,226,170,218,24,216,38,176,37,79,110,156,27,131,228,195,11,24,44,225,36,245,84,127,4,135,116,70,47,179,50,16,44,96,149,202,138,147,12,208,140,96,116,55,43,232,60,168,117,3,11,44,43,137,42,95,190,204,29,228,38,200,28,125,145,220,68,102,199,47,142,190,49,170,17,200,198,10,120,229,118,196,35,177,224,68,226,59,152,16,197,91,30,74,117,148,94,148,123,187,182,51,123,206,231,79,202,172,145,244,215,19,52,126,94,58,230,117,155,87,191,228,58,10,29,198,157,39,44,39,247,63,32,117,153,13,43,119,113,74,54,49,78,208,165,139,150,216,118,124,162,74,255,238,102,214,54,132,106,115,20,13,125,13,63,231,81,163,10,217,35,253,110,229,116,164,146,233,167,249,93,44,235,225,0,211,104,12,194,135,39,92,31,118,101,156,39,76,61,6,254,191,194,82,212,205,45,203,78,115,176,226,198,199,238,103,31,151,27,79,249,9,112,168,16,8,2,25,38,240,219,21,223,151,23,203,114,57,223,65,23,10,60,102,70,232,143,251,176,157,148,217,248,40,59,33,74,75,88,122,110,96,173,206,237,214,67,20,66,206,192,219,108,17,21,6,216,237,145,219,124,148,141,158,84,172,189,165,79,34,187,99,46,177,103,242,161,95,192,255,52,92,3,34,247,123,109,169,50,192,91,112,248,59,38,104,2,239,65,197,50,25,149,134,210,217,184,158,153,15,55,145,191,28,67,16,114,231,187,184,158,53,71,168,6,129,248,77,163,94,1,182,238,23,117,123,74,213,241,242,212,16,115,141,232,215,176,127,243,130,57,225,88,224,106,111,144,46,176,110,96,71,18,74,47,17,170,158,39,85,7,251,224,37,112,22,50,124,148,138,152,134,34,159,193,169,55,239,151,27,101,165,218,246,255,146,195,65,120,194,123,100,143,139,6,128,18,41,64,31,59,244,230,168,51,42,66,17,139,74,180,142,229,181,110,149,115,109,198,221,232,143,163,9,229,115,16,0,20,39,100,36,223,251,137,228,217,247,46,124,231,34,156,40,160,48,103,47,212,218,137,194,129,117,50,207,15,99,239,195,14,124,107,175,52,154,84,31,130,20,84,193,88,218,78,206,31,96,21,86,132,232,129,137,99,148,192,226,106,24,227,108,221,162,178,255,140,8,151,21,176,146,147,98,129,88,241,16,193,91,2,74,70,236,95,175,11,188,56,208,157,117,104,111,198,113,8,117,139,113,79,110,142,36,41,0,195,254,166,74,183,71,172,158,115,192,206,199,51,228,70,101,20,168,253,244,8,31,228,103,97,84,54,218,166,190,187,112,123,70,236,248,131,107,220,148,242,224,196,0,119,62,219,156,196,118,192,29,132,143,9,138,157,83,88,80,128,186,160,19,115,3,129,119,176,143,52,150,80,63,134,38,250,184,97,130,13,22,100,78,58,34,135,84,126,236,218,173,36,204,139,189,16,2,215,90,10,80,118,63,34,155,133,132,17,116,12,70,145,199,10,201,164,225,56,248,252,65,168,184,96,43,14,122,244,167,3,77,4,149,116,40,129,130,229,226,13,50,25,228,236,16,0,139,34,110,147,10,238,11,17,141,168,172,254,250,21,56,129,9,203,157,28,171,66,129,226,183,211,96,62,160,179,171,8,116,39,73,187,235,103,31,238,194,2,232,198,172,50,57,144,124,28,114,88,172,72,175,51,150,4,62,186,169,107,64,170,255,185,191,87,22,245,237,239,197,174,193,43,140,199,87,136,67,216,31,133,192,207,85,215,48,123,252,16,67,127,243,198,106,0,23,193,43,48,128,43,149,231,142,173,185,186,234,83,130,209,19,62,92,143,91,231,89,50,51,115,71,245,239,8,118,240,13,90,7,63,124,207,16,34,233,203,72,188,75,111,189,154,204,26,44,143,6,119,144,216,168,18,50,203,132,163,234,188,115,181,133,135,147,206,13,254,56,46,230,171,131,24,194,161,47,58,28,212,40,232,135,217,207,232,8,162,57,91,44,174,20,148,21,25,212,29,119,206,137,220,148,221,178,66,1,231,194,77,30,1,201,43,64,152,103,206,252,87,234,230,103,79,69,205,190,113,123,209,164,66,132,28,120,86,146,140,91,168,210,47,213,43,182,63,138,62,42,121,19,155,245,56,126,32,106,202,54,79,1,131,52,246,163,114,252,157,133,178,227,9,82,24,85,120,11,239,216,7,210,202,80,175,153,250,238,89,207,228,81,235,144,41,217,69,98,102,80,106,49,154,198,168,179,159,167,240,217,244,7,0,99,172,57,181,139,110,203,24,106,57,68,44,132,172,61,219,142,145,249,61,249,104,215,61,222,246,29,158,223,56,243,62,245,84,131,101,159,192,98,114,50,41,125,84,134,182,20,3,124,17,117,138,240,80,88,14,187,197,231,100,128,73,242,89,223,46,49,196,142,63,39,3,230,128,253,83,57,228,200,34,171,219,176,61,4,180,4,94,173,84,69,191,186,117,11,195,171,95,174,56,125,79,192,89,141,111,201,34,69,99,146,187,131,168,191,158,102,28,33,142,112,229,236,34,175,130,96,144,251,6,112,171,152,25,169,109,226,202,47,204,252,139,97,181,134,53,4,40,52,88,176,246,93,58,204,63,181,33,192,122,171,125,131,46,131,159,184,170,178,135,169,150,188,53,193,35,218,189,198,187,27,231,75,243,125,200,115,196,206,141,183,15,220,93,73,195,105,3,172,41,160,197,17,195,246,156,73,167,242,57,38,244,69,203,92,54,184,16,77,95,198,132,115,87,99,208,242,80,208,227,85,224,155,15,146,64,212,75,2,160,252,70,55,243,176,107,124,153,135,29,200,69,149,31,182,211,115,143,18,78,60,211,107,181,103,85,2,7,139,6,166,81,117,20,122,170,114,114,127,54,89,81,12,253,25,141,218,45,61,131,5,61,201,81,207,183,236,129,213,198,121,160,126,249,229,155,182,169,18,102,202,155,120,121,76,121,213,99,30,167,112,3,192,157,201,200,75,126,209,133,100,153,255,213,97,104,6,126,8,102,196,84,122,90,118,122,2,216,85,167,143,234,35,29,93,39,198,77,163,60,254,189,62,177,64,207,244,230,163,203,64,16,144,125,149,96,245,188,95,246,208,115,128,105,16,14,195,121,50,193,129,202,184,221,238,228,237,66,142,196,45,246,195,21,6,3,115,213,225,61,114,125,139,70,233,174,137,190,208,156,164,169,236,19,218,150,229,148,184,190,190,0,240,189,103,206,117,69,143,215,181,15,35,98,5,198,200,201,72,188,111,27,79,28,240,120,175,13,35,48,69,219,91,71,140,158,42,225,121,152,216,187,156,14,90,85,102,236,23,252,206,10,226,179,43,76,252,27,190,6,8,85,175,30,83,101,107,145,101,40,234,22,111,106,216,236,208,250,100,77,121,84,213,17,30,98,127,254,64,91,166,17,220,61,114,215,2,156,167,118,221,159,165,171,151,108,156,60,60,26,39,34,96,68,54,41,214,208,112,243,249,83,142,155,1,200,143,8,115,63,233,49,163,203,158,13,11,211,112,194,93,61,112,166,37,172,88,71,148,96,238,95,100,52,153,222,181,142,73,215,65,248,196,110,9,219,2,211,145,4,163,179,226,235,58,197,235,2,250,79,145,184,18,229,49,224,162,182,17,174,113,222,128,8,123,160,45,76,215,84,251,187,99,91,58,5,4,250,181,147,221,49,238,40,93,131,141,155,101,98,77,79,200,62,137,58,155,99,101,228,143,54,241,253,140,94,245,40,230,228,16,64,70,90,11,97,223,246,231,13,161,207,16,223,191,45,50,58,170,255,19,26,236,149,249,85,34,54,111,184,187,146,40,197,45,97,176,32,152,57,43,222,149,22,85,186,233,114,27,253,25,236,142,242,153,200,116,19,0,135,160,14,235,53,173,14,12,175,222,51,252,112,142,25,35,5,128,245,11,152,15,228,22,174,75,56,87,89,229,231,125,240,30,37,141,229,19,245,250,62,159,54,58,96,147,246,238,216,139,24,238,140,107,184,187,146,151,93,150,124,200,145,147,136,17,253,104,35,199,168,53,4,251,110,186,176,235,152,31,210,138,159,142,212,10,163,66,182,243,86,101,200,96,147,63,147,28,122,163,119,50,210,245,216,254,216,3,30,219,61,49,225,178,31,84,112,210,152,14,123,98,116,83,11,9,230,199,134,211,254,53,77,193,66,180,192,42,175,132,174,62,147,209,27,50,97,167,215,23,204,205,218,13,119,94,245,28,94,209,79,12,38,11,157,69,205,31,194,151,120,53,225,90,231,191,12,115,110,53,149,173,209,26,42,109,109,222,24,139,54,232,3,170,145,29,113,69,115,71,57,204,197,78,139,136,25,28,29,89,39,80,210,188,52,68,174,178,29,46,246,193,255,133,243,203,174,178,22,53,124,32,123,113,72,205,219,110,211,184,19,178,246,35,191,219,48,238,55,151,179,223,5,237,216,32,154,135,27,202,19,5,153,32,61,250,66,119,6,17,46,24,133,189,117,230,30,34,7,0,178,10,105,68,119,222,92,76,236,159,157,135,5,151,157,91,193,141,51,175,8,109,250,19,193,160,165,0,151,126,197,0,69,94,159,37,108,237,1,220,188,238,223,40,163,91,212,202,251,61,253,131,17,186,143,253,96,123,37,121,82,221,161,55,253,249,35,68,13,81,246,99,214,110,230,133,27,43,71,129,37,126,252,19,47,149,236,94,170,203,154,161,79,106,6,183,154,118,213,223,234,130,212,25,84,110,137,246,150,13,242,4,180,92,196,134,211,13,110,121,221,187,67,9,162,48,170,236,63,117,177,73,217,215,60,163,76,75,213,186,210,216,106,88,39,135,54,34,67,8,199,192,36,127,206,236,57,127,91,193,95,171,237,76,207,134,254,131,130,18,35,147,110,196,5,146,168,47,75,132,59,78,233,162,26,244,169,78,27,162,172,158,140,157,218,217,228,188,169,47,223,110,18,144,255,84,16,201,243,0,49,77,8,247,241,202,130,205,135,118,55,10,21,53,54,83,204,13,88,228,128,39,156,50,250,147,230,222,70,116,127,122,26,77,149,189,230,172,188,190,239,44,120,45,33,100,69,77,29,159,146,51,26,155,118,132,113,160,234,221,172,193,254,199,135,153,50,231,244,131,144,26,219,233,148,180,28,119,67,240,173,136,218,110,216,165,110,129,87,72,234,168,115,104,168,163,35,209,49,117,78,186,113,190,30,12,178,107,21,147,46,247,130,251,208,182,156,15,194,228,135,20,155,218,194,32,160,161,245,202,36,231,96,73,97,107,173,200,91,206,22,177,53,111,113,148,249,157,45,163,255,85,95,83,234,133,242,86,198,64,165,72,98,207,136,6,13,204,3,162,233,185,33,190,185,144,4,101,79,2,71,117,46,213,60,141,2,54,90,141,240,180,84,94,241,222,73,35,206,117,133,86,9,34,1,186,254,160,62,244,161,168,18,209,57,233,54,25,113,93,0,245,234,16,102,184,88,53,186,183,102,141,47,217,206,214,78,196,185,37,180,5,222,102,244,109,200,113,171,83,5,94,16,121,175,196,104,11,136,89,235,173,12,107,121,212,37,214,120,159,26,27,48,125,141,234,199,80,150,232,228,186,99,139,48,105,32,152,37,243,249,151,188,47,18,231,5,13,55,32,91,142,3,18,77,221,129,232,11,13,54,72,188,74,166,229,244,143,118,50,231,203,203,145,184,78,251,28,71,156,128,138,85,157,87,62,71,154,241,245,161,251,54,192,20,149,44,4,49,53,136,30,53,81,174,5,173,180,37,142,255,102,92,213,15,33,244,126,25,55,251,206,203,176,32,167,3,95,152,38,159,235,243,17,94,172,209,80,14,209,113,62,164,98,2,14,113,88,18,227,39,26,159,161,230,255,108,192,77,66,172,72,125,4,54,217,86,94,2,76,176,47,237,107,100,61,179,187,168,169,208,44,0,53,207,7,39,114,34,1,75,19,25,71,175,72,198,248,57,19,230,35,113,37,122,238,60,223,2,60,177,37,100,73,222,64,17,159,205,127,50,192,82,165,211,67,62,160,19,33,9,227,207,159,87,171,94,94,72,230,10,155,195,208,56,130,88,163,209,140,176,192,76,193,124,36,102,134,159,235,109,71,237,166,184,170,216,199,49,104,243,81,111,157,63,221,99,253,94,227,186,128,10,44,200,164,215,229,79,68,240,18,164,106,120,168,141,182,132,73,43,110,228,131,42,130,141,36,112,85,219,153,134,68,161,3,197,234,205,191,243,153,118,125,251,46,28,142,40,80,134,19,194,77,5,3,220,132,10,204,107,154,5,37,6,90,237,97,11,5,57,185,7,139,64,10,139,204,162,79,203,136,13,220,147,238,210,229,109,77,124,241,27,225,73,79,53,175,230,232,166,203,153,217,30,96,74,32,8,109,90,51,117,88,84,52,58,106,119,38,91,115,68,32,115,196,88,202,165,6,158,161,180,61,38,82,87,31,249,118,149,249,96,182,208,21,82,78,102,208,125,116,79,86,177,105,26,159,73,235,127,5,35,104,22,139,58,169,164,209,255,134,89,95,191,75,86,161,133,66,212,114,4,64,195,109,238,115,13,103,43,156,72,170,171,22,143,23,211,21,55,213,147,42,36,169,90,4,215,163,74,64,244,204,91,56,188,160,5,49,95,67,124,157,147,223,136,204,145,69,114,254,249,58,22,233,253,62,111,71,153,13,113,44,144,83,16,207,155,9,94,59,122,211,166,147,182,78,140,128,224,174,160,109,194,254,65,148,31,157,38,43,74,249,245,180,131,40,111,248,81,120,48,247,236,170,73,97,135,150,108,14,222,241,83,38,5,1,72,157,142,58,225,174,185,233,9,179,63,142,122,255,156,6,5,197,188,144,57,111,135,61,74,218,244,157,9,190,173,163,242,235,224,149,198,238,254,18,66,156,235,184,144,1,110,201,200,71,185,8,228,222,133,12,105,31,131,109,102,113,145,230,90,245,242,208,201,92,108,5,210,55,140,185,66,28,123,118,157,236,61,37,79,250,241,231,4,64,216,129,208,142,123,164,182,144,30,122,238,132,176,56,164,108,12,183,213,172,167,143,191,9,121,219,42,196,137,111,158,154,81,38,86,147,64,106,25,225,155,55,61,28,108,15,115,168,39,204,152,252,211,36,212,156,158,193,242,121,226,199,184,111,154,119,48,219,90,220,14,97,218,82,255,26,142,139,190,61,225,114,17,32,144,0,32,244,161,179,224,118,120,194,92,226,188,180,156,222,222,101,169,81,96,95,218,131,158,35,240,234,143,241,248,122,85,102,76,171,162,51,15,127,91,148,184,141,25,203,41,81,32,242,124,234,55,228,19,16,138,116,212,109,105,138,127,108,58,159,92,219,116,240,219,250,133,100,189,100,162,248,89,12,213,231,239,28,96,139,145,51,83,15,229,64,178,174,54,0,54,13,94,100,218,134,133,249,228,130,255,150,191,190,156,6,198,71,183,54,92,74,182,137,40,227,1,65,224,75,215,205,52,149,91,29,74,74,175,187,53,128,169,133,101,237,79,251,49,160,122,126,64,75,130,254,6,219,215,171,158,117,84,170,180,98]);

var rightPad = function (str, padString, padToLength) {
    'use strict';
    str = String(str);

    while (str.length < padToLength) {
        str = str + padString;
    }

    return str;
};

var $ = {
    ajax: function (strLink, strParams, strMethod, callback) {
        'use strict';

        var request = new XMLHttpRequest();
        strMethod = strMethod.toUpperCase();
        request.responseType = (strLink.indexOf('/download/') > -1 && strParams === '' ? 'arraybuffer' : 'text');

        callback = callback || function () { };

        request.onreadystatechange = function () {
            var normalizedError;

            if (request.readyState === 4) {
                if (strLink.indexOf('/download/') > -1 && strParams === '') {
                    callback(new Uint8Array(request.response));
                } else {
                    callback(request.response);
                }
            }
        };

        request.open(strMethod, strLink, true);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        if (strLink === '/test.txt?if_modified_since=true') {
            request.setRequestHeader('If-Modified-Since', $.if_modified_since_changestamp);
        }
        if (strMethod === 'POST') {
            request.send(strParams);
        } else {
            request.send();
        }

        return request;
    },
    runTests: function (key) {
		$.tests[key].test_random = '1000';
		$.tests[key].running = true;
        $.runTest(key, 0);
    },
    intRun: 10,
	testsEnded: false,
	test_random: rightPad(parseInt(Math.random().toString().substring(2, 7), 10).toString(), '0', 5),
    test_change_stamp: (function () {
        var test_change_stamp = new Date();
        test_change_stamp.setMinutes(test_change_stamp.getMinutes());
        test_change_stamp = test_change_stamp.toISOString().replace('T', ' ').replace(/\..*/gi, '');
        return test_change_stamp;
    }()),
    changeStatus: function (key, intCurrent, strOldClass, strNewClass, strStatus, strErrorText) {
        var objLabel = document.getElementById('test' + key + intCurrent + '_label');
        objLabel.classList.remove(strOldClass);
        objLabel.classList.add(strNewClass);
        if (strNewClass === 'fail') {
            document.getElementById('status-note-' + key).textContent = '(ERROR) ' + $.tests[key].tests[intCurrent][0];
			$.tests[key].error = true;
			$.ajax('https://www.sunnyserve.com/env/tst.acceptnc_test', 'action=fail&id=' + $.intID + '&fail_name=' + encodeURIComponent(document.getElementById('test' + key + intCurrent + '_label').innerText), 'POST', function (data) {

			});
        } else {
            document.getElementById('status-note-' + key).textContent = '(RUNNING) ' + $.tests[key].tests[intCurrent][0];
        }
        objLabel.strStatus = strStatus;
        objLabel.strErrorText = strErrorText;
    },
    runTest: function (key, intCurrent) {
        'use strict';
        // console.log('run_test:', intCurrent);
		if (intCurrent === 0) {
			$.tests[key].test_random = qs['seq_numbers'] === 'true' ? (parseInt($.tests[key].test_random, 10) + 1).toString() : rightPad(parseInt(Math.random().toString().substring(2, 6), 10).toString(), '0', 4);
		}
        var arrCurrent = $.tests[key].tests[intCurrent];
        if (arrCurrent === undefined) {
			var minRuns = Infinity, minKey, error = false;
			for (var key2 in $.tests) {
				if ($.tests.hasOwnProperty(key2) && key2[0] !== '_') {
					var runs = 0;
					if ($.tests[key2].intRun !== undefined) {
						runs = $.tests[key2].intRun;
					}
					if (runs < minRuns) {
						minRuns = runs;
						minKey = key2;
					}
					error = error || $.tests[key2].error || false;
				}
			}
			if ($.tests[key].intRun === undefined) {
				$.tests[key].intRun = 0;
			}
			$.tests[key].intRun += 1;
            if (key[0] !== '_' && $.tests[key].intRun < ($.intRun * 5) && (minRuns + 1) < $.intRun && !error) {
                var i = 0, len = $.tests[key].tests.length;
				for (; i < len; i += 1) {
					$.changeStatus(key, i, 'pass', 'waiting');
				}

				$.ajax('https://www.sunnyserve.com/env/tst.acceptnc_test', 'action=success&id=' + $.intID, 'POST', function (data) {

				});
                $.runTest(key, 0);
            } else {
				$.tests[key].running = false;
				var bolEndTests = true;

				for (var key2 in $.tests) {
					if ($.tests.hasOwnProperty(key2) && key2[0] !== '_') {
						if ($.tests[key2].running || $.tests[key].error) {
							bolEndTests = false;
							break;
						}
					}
				}

				if (key[0] !== '_' && bolEndTests && $.testsEnded !== true) {
					$.testsEnded = true;
					$.ajax('http://127.0.0.1:45654', '', 'GET', function (data) {});
					$.ajax('https://www.sunnyserve.com/env/tst.acceptnc_test', 'action=end&id=' + $.intID, 'POST', function (data) {
						alert('Tests finished!');
					});
				}
                document.getElementById('status-note-' + key).textContent = ' (STOPPED)';
				if (key[0] === '_') {
		            for (var key2 in $.tests) {
		                if ($.tests.hasOwnProperty(key2) && key2 !== key) {
		                    if (qs[key2] === 'true') {
		                        $.runTests(key2);
		                    }
		                }
		            }
				}
            }

            var num = parseInt(document.getElementById('iterations-' + key).innerText, 10);
            document.getElementById('iterations-' + key).innerText = num + 1;
            return;
        }
        var strType = arrCurrent[1], intStatusCode, strLink, strArgs, strExpectedOutput, i, arrStrActualOutput, expectedOutput;
        if (strType === 'ajax') {
            // console.log('ASDFASDFASDFASDF');
            if (typeof (arrCurrent[5]) === 'string' && !/DOWNLOAD$|Login/.test(arrCurrent[0])) {
                arrCurrent[5] = arrCurrent[5].replace(/\r\n/gi, '\n');
            }

            var intStatusCode = arrCurrent[2];
            var strLink = arrCurrent[3].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random);
            var strArgs = arrCurrent[4];
            var strExpectedOutput = arrCurrent[5];
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            // console.log('P##########################', strArgs);
            var ajax = $.ajax(strLink, strArgs, 'POST', function (data) {
                //console.log(data);
                if (data.replace && data.indexOf('<!DOCTYPE html>') !== 0) {
                    data = data.replace('c:\\users\\nunzio\\repos\\envelope\\src\\', '');
                    data = data.replace(/c\:\\users\\nunzio\\repos\\envelope\\/gi, '../');
                    data = data.replace(/\.\.\\\.\.\\/gi, '../');
                    data = data.replace(/\\(?![rnt])/gi, '/');
					data = data.replace(' (0x0000274D/10061)', '');
                    data = data.replace(/\.\.\/src\//gi, '');
                }
                var bolEqual = true;
                for (var i = 0, len = data.length; i < len; i += 1) {
                    if (data[i] !== strExpectedOutput[i]) {
                        bolEqual = false;
                    }
                }
                if ((strExpectedOutput === data || bolEqual) && intStatusCode === ajax.status) {
                    $.changeStatus(key, intCurrent, 'running', 'pass');
                    $.runTest(key, intCurrent + 1);
                } else {
                    console.log(strExpectedOutput.length, (strExpectedOutput.replace ? strExpectedOutput.replace(/\n/g, '\\n').replace(/\r/g, '\\r') : strExpectedOutput));
					console.log(data.length, (data.replace ? data.replace(/\n/g, '\\n').replace(/\r/g, '\\r') : data));

                    document.getElementById('actual-status-' + key).value = ajax.status;
                    document.getElementById('actual-output-' + key).value = data;
                    $.changeStatus(key, intCurrent, 'running', 'fail', ajax.status, data);
                }
            });
        } else if (strType === 'ajax spam') {
            if (typeof arrCurrent[5] === 'string') {
                arrCurrent[5] = arrCurrent[5].replace(/\r\n/gi, '\n');
            }

            intStatusCode = arrCurrent[2];
            var strLink = arrCurrent[3].replace(/\{\{test_random\}\}/g, $.test_random);
            var strArgs = arrCurrent[4];
            strExpectedOutput = arrCurrent[5];
            $.changeStatus(key, intCurrent, 'waiting', 'running');

			var i = 0, len = 100;
            var arrAjax = new Array(len), intNumFailures = 0, intNumFinished = 0;
            while (i < len) {
                (function (i) {
                    arrAjax[i] = $.ajax(strLink, strArgs, 'POST', function (data) {
                        if (data === strExpectedOutput && intStatusCode === arrAjax[i].status) {

                        } else {
                            intNumFailures += 1;
                            //// console.log('>' + intCurrent + '|' + data + '|' + error + '<');
                            // console.log(ajax.status, data);
                            // console.log(intStatusCode, strExpectedOutput);
                            // console.log(data.error_text);
                            document.getElementById('actual-status-' + key).value = intNumFailures;
                            document.getElementById('actual-output-' + key).value = data;
                        }
                        intNumFinished += 1;
                        if (intNumFinished == len && intNumFailures === 0) {
							$.changeStatus(key, intCurrent, 'running', 'pass');
                            $.runTest(key, intCurrent + 1);
                        } else if (intNumFinished == len) {
							$.changeStatus(key, intCurrent, 'running', 'fail', i, data);
						}
                    });
                })(i)
                i += 1;
            }
        } else if (strType === 'upload') {
            arrCurrent[5] = arrCurrent[5].replace(/\r\n/gi, '\n');
            var intStatusCode = arrCurrent[2];
            var strLink = arrCurrent[3];
            var strArgs = arrCurrent[4].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random);
            var strExpectedOutput = arrCurrent[5];
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            var formData = new FormData();
            var blob = new Blob([binaryArray], { type: 'application/x-zip-compressed' });
            formData.append('file_name', strArgs);
            formData.append('file_content', blob);
            var request = new XMLHttpRequest();
            request.open('POST', strLink);
            request.onload = function () {
                var response = request.response.replace('c:\\users\\nunzio\\repos\\envelope\\src\\', '');
                response = response.replace(/\r\n/gi, '\n');
                if (response === strExpectedOutput && intStatusCode === request.status) {
                    $.changeStatus(key, intCurrent, 'running', 'pass', request.status, response);
                    $.runTest(key, intCurrent + 1);
                } else {
                    $.changeStatus(key, intCurrent, 'running', 'fail', request.status, response);
                    document.getElementById('actual-status-' + key).value = request.status;
                    document.getElementById('actual-output-' + key).value = response;
                }
            };
            request.send(formData);
        } else if (strType === 'websocket start') {
            $.changeStatus(key, intCurrent, 'waiting', 'running');
			if ($.tests[key].socket) {
				WS.closeSocket($.tests[key].socket);
			}
            $.tests[key].socket = WS.openSocket(key, key);
            var i = 0;
            WS.requestFromSocket($.tests[key].socket, key, 'INFO', function (data, error, errorData) {
                if (i === -1) {
                    return;
                }
                i = -1;
                if (!error) {
                    $.tests[key].socket.stayClosed = true;
                    $.changeStatus(key, intCurrent, 'running', 'pass', 0, JSON.stringify(data));
                    $.runTest(key, intCurrent + 1);
                } else {
                    $.changeStatus(key, intCurrent, 'running', 'fail', 0, JSON.stringify(errorData));
                    document.getElementById('actual-output-' + key).value = JSON.stringify(errorData);
                }
            });
        } else if (strType === 'websocket') {
            if (typeof arrCurrent[3] === 'string') {
                arrCurrent[3] = arrCurrent[3].replace(/\r\n/gi, '\n').replace(/\{\{test_random\}\}/g, $.test_random);
            }
            var strArgs = (typeof arrCurrent[3] === 'string' ? arrCurrent[3].replace(/\{\{test_random1\}\}/g, $.tests[key].test_random).replace(/\{\{CHANGESTAMP\}\}/gi, WS.encodeForTabDelimited($.tests[key].lastModified)) : arrCurrent[3]);
            var arrStrExpectedOutput = arrCurrent[4];
            var arrStrActualOutput = [];
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            var i = 0;
            var bolIsRead = strArgs.substring ? strArgs.substring(0, 9) === 'FILE\tREAD' : false;
            var bolIsWrite = strArgs.substring ? strArgs.substring(0, 10) === 'FILE\tWRITE' : false;
            //// console.log('strArgs: ' + strArgs);
            WS.requestFromSocket($.tests[key].socket, key, strArgs, function (data, error, errorData) {
                if (bolIsRead || bolIsWrite) {
                    $.tests[key].lastModified = data.substring(0, data.indexOf('\n'));
                    if (!$.tests[key].lastModified) {
                        $.tests[key].lastModified = data;
                    }
                    bolIsRead = false;
                    bolIsWrite = false;
                }
                if (i === -1) {
                    return;
                }
                //console.log(i, data);
                if (data !== '\\.') {
                    data = data.replace(/c\:\\users\\nunzio\\repos\\envelope\\/gi, '../');
	                data = data.replace(/\.\.\\\.\.\\/g, '../');
                    data = data.replace(/\\(?![rnt])/g, '/');
					data = data.replace(/\/Users\\nunzio\//g, '/Users/nunzio/');
					data = data.replace(/\\role/g, '/role');
					data = data.replace(/\\trusted_g/g, '/trusted_g');
					data = data.replace(/C\:\/Users\\nunzio\/AppData\/Roaming\//g, '/home/super/.');
					data = data.replace(/C\:\/Users\/Admin\/AppData\/Roaming\//g, '/home/super/.');
					data = data.replace(/\/home\/nunzio\//g, '/home/super/');
					data = data.replace(/\/Users\/joseph\//g, '/home/super/');
					data = data.replace(/\/Users\/super\//g, '/home/super/');
					data = data.replace(/\/Users\/nunzio\//g, '/home/super/');
					data = data.replace(/\/usr\/home\/super\//g, '/home/super/');
					data = data.replace(/\/home\/super\/Desktop\/test\/test-envelope\/envelope-master\//g, '/home/super/Repos/envelope/');
					data = data.replace(/\/usr\/local\/etc\//g, '/home/super/Repos/envelope/');
					data = data.replace(/\\test/g, '/test');
	                data = data.replace(/\/\//g, '\\\\');
	                data = data.replace('CreateFile failed: 0x50 (The file exists.\r\n)', 'File already exists.');
                    data = data.replace(/\.\.\/src\/app/gi, '/home/super/Repos/envelope/src/app');
                    data = data.replace(/\.\.\/src\/role/gi, '/home/super/Repos/envelope/src/role');
                    data = data.replace(/\.\.\/src\/web_root/gi, '/home/super/Repos/envelope/src/web_root');
                    data = data.replace(/\.\.\/src\//gi, '');
                    data = data.replace('C:', '');
				}
                arrStrActualOutput.push(data.replace(/transactionid = .*\n/gim, '').replace(/temp_select_0x[^.]*\./gim, 'rtesting_table.')
                    .replace(/\.\.\.[^.]*\./gi, 'rtesting_table.')
                    .replace(/temp_.*\b/gi, 'rtesting_table'));
                i += 1;
                if (i === arrStrExpectedOutput.length || data === 'TRANSACTION COMPLETED' || error) {
                    //console.log(i, data);
                    var j, k, l, len, len1;
                    for (j = 0, k = 0, len = i; j < len; j += 1, k += 1) {
                        if (arrStrActualOutput[j] === arrStrExpectedOutput[k].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random) ||
                            arrStrExpectedOutput[k] === 'ANYTHING' ||
                            arrStrExpectedOutput[k].substring(0, 8) === 'OPTIONAL' ||
                            (
                                (
                                    arrStrExpectedOutput[k] === 'START' ||
                                    arrStrExpectedOutput[k] === 'END' ||
                                    arrStrExpectedOutput[k] === 'Failed to get canonical path' ||
                                    arrStrExpectedOutput[k] === 'Failed to open file for writing'
                                ) &&
                                arrStrActualOutput[j].indexOf(arrStrExpectedOutput[k]) === 0
                            )
                        ) {
                            if (arrStrExpectedOutput[k].substring(0, 8) === 'OPTIONAL' &&
                                arrStrActualOutput[j] !== arrStrExpectedOutput[k].substring(8).replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random)
                            ) {
                                j -= 1;
                            }
                            error = false;
                        } else {
                            error = true;
                            break;
                        }
                    }
                    if (error === false) {
                        $.changeStatus(key, intCurrent, 'running', 'pass', 0, JSON.stringify(arrStrActualOutput));
                        $.runTest(key, intCurrent + 1);
                        i = -1;
                    } else {
						console.log(arrStrExpectedOutput[k].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random).length, arrStrExpectedOutput[k].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random));
						console.log(arrStrActualOutput[j].length, arrStrActualOutput[j]);
                        $.changeStatus(key, intCurrent, 'running', 'fail', 0, JSON.stringify(arrStrActualOutput));
                        document.getElementById('actual-output-' + key).value = JSON.stringify(arrStrActualOutput);
                        i = -1;
                    }
                }
            });
			if (arrStrExpectedOutput.length === 0) {
				$.changeStatus(key, intCurrent, 'running', 'pass', 0, JSON.stringify(arrStrActualOutput));
				$.runTest(key, intCurrent + 1);
			}
        } else if (strType === 'websocket send from') {
            if (typeof arrCurrent[3] === 'string') {
                arrCurrent[3] = arrCurrent[3].replace(/\r\n/gi, '\n').replace(/\{\{test_random\}\}/g, $.test_random);
            }
            var strArgs = (typeof arrCurrent[3] === 'string' ? arrCurrent[3].replace(/\{\{test_random1\}\}/g, $.tests[key].test_random).replace(/\{\{CHANGESTAMP\}\}/gi, WS.encodeForTabDelimited($.tests[key].lastModified)) : arrCurrent[3]);
            var arrStrExpectedOutput = arrCurrent[4];
            var arrStrActualOutput = [];
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            var i = 0;
            var bolIsRead = strArgs.substring ? strArgs.substring(0, 9) === 'FILE\tREAD' : false;
            var bolIsWrite = strArgs.substring ? strArgs.substring(0, 10) === 'FILE\tWRITE' : false;
            //// console.log('strArgs: ' + strArgs);
            WS.requestFromSocket($.tests[key].socket, key, strArgs, function (data, error, errorData) {
                if (i < 3 || i % 50 == 0) {
                    $.tests[key].socket.stayClosed = false;
                    $.tests[key].socket.close();
                }
                if (i === -1) {
                    return;
                }
                //console.log(i, data);
                data = data.replace(/..\\..\\/gi, '../');
                data = data.replace(/\\(?![rnt])/gi, '/');
                arrStrActualOutput.push(data.replace(/transactionid = .*\n/gim, ''));
                i += 1;
                if (i === arrStrExpectedOutput.length || data === 'TRANSACTION COMPLETED' || error) {
                    //console.log(i, data);
                    var j, k, l, len, len1;
                    for (j = 0, k = 0, len = i; j < len; j += 1, k += 1) {
                        if (arrStrActualOutput[j] === arrStrExpectedOutput[k].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random) ||
                            arrStrExpectedOutput[k] === 'ANYTHING' ||
                            arrStrExpectedOutput[k].substring(0, 8) === 'OPTIONAL' ||
                            (
                                (
                                    arrStrExpectedOutput[k] === 'START' ||
                                    arrStrExpectedOutput[k] === 'END' ||
                                    arrStrExpectedOutput[k] === 'Failed to get canonical path' ||
                                    arrStrExpectedOutput[k] === 'Failed to open file for writing'
                                ) &&
                                arrStrActualOutput[j].indexOf(arrStrExpectedOutput[k]) === 0
                            )
                        ) {
                            if (arrStrExpectedOutput[k].substring(0, 8) === 'OPTIONAL' &&
                                arrStrActualOutput[j] !== arrStrExpectedOutput[k].substring(8).replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random)
                            ) {
                                j -= 1;
                            }
                            error = false;
                        } else {
							console.log(arrStrActualOutput[j].length, arrStrActualOutput[j].replace(/\n/g, '\\n'));
							console.log(arrStrExpectedOutput[k].length, arrStrExpectedOutput[k].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random).replace(/\n/g, '\\n'));

                            error = true;
                            break;
                        }
                    }
                    if (error === false) {
                        $.changeStatus(key, intCurrent, 'running', 'pass', 0, JSON.stringify(arrStrActualOutput));
                        $.runTest(key, intCurrent + 1);
                        i = -1;
                    } else {
                        $.changeStatus(key, intCurrent, 'running', 'fail', 0, JSON.stringify(arrStrActualOutput));
                        document.getElementById('actual-output-' + key).value = JSON.stringify(arrStrActualOutput);
                        i = -1;
                    }
                }
            });
        } else if (strType === 'websocket cancel') {
            arrCurrent[3] = arrCurrent[3].replace(/\r\n/gi, '\n');
            var strArgs = arrCurrent[3].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random);
            var intCancelAtMessage = arrCurrent[4] !== undefined ? arrCurrent[4] : 1;
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            i = 0;
            WS.requestFromSocket($.tests[key].socket, key, strArgs, function (data, error) {
                if (i === (intCancelAtMessage - 1)) {
                    WS.requestFromSocket($.tests[key].socket, key, 'CANCEL', function (data) {
                        // console.log(data);
                    });
                } else if (	JSON.stringify(data) === ml(function() {/*"Query failed: FATAL\nerror_text\tERROR:  canceling statement due to user request\\n\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t\n"*/}) ||
							JSON.stringify(data) === ml(function() {/*"FATAL\nerror_text\tERROR:  canceling statement due to user request\\n\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t\n"*/}) ||
							JSON.stringify(data) === ml(function() {/*"TRANSACTION COMPLETED"*/})) {
                    $.changeStatus(key, intCurrent, 'running', 'pass');
                    $.runTest(key, intCurrent + 1);
                }
                i += 1;
            });
			if (intCancelAtMessage === 0) {
                WS.requestFromSocket($.tests[key].socket, key, 'CANCEL', function (data) {
                    // console.log(data);
                });
			}
        } else if (strType === 'websocket close in request') {
            arrCurrent[3] = arrCurrent[3].replace(/\r\n/gi, '\n');
            var strArgs = arrCurrent[3].replace(/\{\{test_random\}\}/g, $.test_random).replace(/\{\{test_random1\}\}/g, $.tests[key].test_random);
            var intCloseAtMessage = arrCurrent[4] !== undefined ? arrCurrent[4] : 1;
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            i = 0;
            WS.requestFromSocket($.tests[key].socket, key, strArgs, function (data, error) {
                if (i === (intCloseAtMessage - 1)) {
	                WS.closeSocket($.tests[key].socket);
                    $.changeStatus(key, intCurrent, 'running', 'pass');
                    $.runTest(key, intCurrent + 1);
                }
                i += 1;
            });
			if (intCloseAtMessage === 0) {
                WS.closeSocket($.tests[key].socket);
			}
        } else if (strType === 'websocket end') {
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            WS.closeSocket($.tests[key].socket);
            $.changeStatus(key, intCurrent, 'running', 'pass');
            $.runTest(key, intCurrent + 1);
        } else if (strType === 'wait') {
            $.changeStatus(key, intCurrent, 'waiting', 'running');
            setTimeout(function () {
                $.changeStatus(key, intCurrent, 'running', 'pass');
                $.runTest(key, intCurrent + 1);
            }, 5000);
        }
    }
};

function qryToJSON(strQueryString) {
    'use strict';
    var arrKeyValueList = [], jsnQueryString = {}, strKeyValue, i, len, strKey, strValue, jsnNavigator, arrSubParts, sub_i, sub_len;

    if (strQueryString) {
        arrKeyValueList = strQueryString.split('&');

        for (i = 0, len = arrKeyValueList.length; i < len; i += 1) {
            strKeyValue = arrKeyValueList[i];
            strKey = strKeyValue.substring(0, strKeyValue.indexOf('='));
            strValue = decodeURIComponent(strKeyValue.substring(strKeyValue.indexOf('=') + 1));

            jsnQueryString[strKey] = strValue;

            // if a dot is found in the key: create a sub JSON structure
            if (strKey.indexOf('.') > -1) {
                arrSubParts = strKey.split('.');

                jsnNavigator = jsnQueryString;
                for (sub_i = 0, sub_len = arrSubParts.length; sub_i < sub_len; sub_i += 1) {
                    if (sub_i < sub_len - 1) {
                        jsnNavigator[arrSubParts[sub_i]] = jsnNavigator[arrSubParts[sub_i]] || {};
                    } else {
                        jsnNavigator[arrSubParts[sub_i]] = jsnNavigator[arrSubParts[sub_i]] || strValue;
                    }

                    jsnNavigator = jsnNavigator[arrSubParts[sub_i]];
                }
            }
        }
    }

    return jsnQueryString;
}

function qryGetVal(strQueryString, strKey) {
    'use strict';
    var arrKeyValueList, strSlice, i, len;

    if (strQueryString) {
        arrKeyValueList = strQueryString.split('&');

        for (i = 0, len = arrKeyValueList.length; i < len; i = i + 1) {
            strSlice = arrKeyValueList[i];

            if (strSlice.split('=')[0] === strKey) {
                return decodeURIComponent(strSlice.substring(strSlice.indexOf('=') + 1));
            }
        }
    }

    return '';
}

function qrySetVal(strQueryString, strKeyValue) {
    'use strict';
    strQueryString = qryDeleteKey(strQueryString, strKeyValue.split('=')[0]);
    strQueryString = strQueryString + (strQueryString ? '&' : '') + strKeyValue;

    return strQueryString;
}

function qryDeleteKey(strQueryString, strKey) {
    'use strict';
    var arrKeyValueList, strSlice, i, len;

    if (strQueryString) {
        arrKeyValueList = strQueryString.split('&');

        for (i = 0, len = arrKeyValueList.length; i < len; i = i + 1) {
            strSlice = arrKeyValueList[i];

            if (strSlice.split('=')[0] === strKey) {
                arrKeyValueList.splice(i, 1);

                break;
            }
        }

        return arrKeyValueList.join('&');
    }

    return '';
}

function getQueryString() {
    'use strict';
    return window.location.search.substring(1);
}

function pushState(stateObj, title, url) {
    history.pushState(stateObj, title, url);
}

function pushQueryString(QS) {
    var arrNewQS = QS.split('&'), i, len, newQS = getQueryString();
    for (i = 0, len = arrNewQS.length; i < len; i += 1) {
        newQS = qrySetVal(newQS, arrNewQS[i]);
    }
    pushState({}, '', '?' + newQS);
}

function ml(func) {
    'use strict';

    func = func.toString();

    return func.substring(func.indexOf('/*') + 2, func.indexOf('*/'));
}

(function () {
    'use strict';

    // encodeForTabDelimited('asdf\\asdf\\asdf\r\nasdf\r\nasdf\tasdf\tasdf')
    function encodeForTabDelimited(strValue) {
        return strValue === '\\N' ? strValue :
                strValue.replace(/\\/g, '\\\\') // double up backslashes
                        .replace(/\n/g, '\\n')  // replace newline with the text representation '\n'
                        .replace(/\r/g, '\\r')  // replace carriage return with the text representation '\r'
                        .replace(/\t/g, '\\t')  // replace tab with the text representation '\t'
                        .replace(/^NULL$/g, '\\N');
    }

    var bolPreventErrors = false;
    function webSocketConnectionErrorDialog(socket, addinText, retryCallback, cancelCallback) {

        if (!document.getElementById('dialog-from-dialog-ws-conn-error') && bolPreventErrors === false) {
            var templateElement = document.createElement('template');

            templateElement.setAttribute('id', 'dialog-ws-conn-error');
            templateElement.setAttribute('data-theme', 'error');
            templateElement.innerHTML = ml(function () {/*
                <gs-page>
                    <gs-header><center><h3>There was an error!</h3></center></gs-header>
                    <gs-body padded>
                        <pre style="white-space: pre-wrap;">
    There has been an error with the Database connection.{{ADDIN}}</pre>
                    </gs-body>
                    <gs-footer>
                        <gs-grid gutter reflow-at="420">
                            <gs-block><gs-button dialogclose>Try to reconnect</gs-button></gs-block>
                            <gs-block><gs-button dialogclose>Dismiss so I can copy my progress</gs-button></gs-block>
                        </gs-grid>
                    </gs-footer>
                </gs-page>
            */
            });
        }
    }

    function webSocketNormalizeError(event) {
        var i, len, arrLines, arrLine, strData,
            jsnRet = {
                'error_title': '',
                'error_text': '',
                'error_detail': '',
                'error_hint': '',
                'error_query': '',
                'error_context': '',
                'error_position': '',
                'error_notice': '',
                'original_data': event
            };

        event = event || {};

        jsnRet.error_text = event.reason || '';

        // if there is message data: parse it
        if (event.data) {
            strData = event.data;

            // strip out messageid
            if (strData.substring(0, strData.indexOf(' ')) === 'messageid') {
                strData = strData.substring(strData.indexOf('\n') + 1);
            }

            // strip out response number
            if (strData.substring(0, strData.indexOf(' ')) === 'responsenumber') {
                strData = strData.substring(strData.indexOf('\n') + 1);
            }

            // strip out fatal
            if (strData.indexOf('FATAL\n') === 0) {
                strData = strData.substring(strData.indexOf('\n') + 1);
            }

            // strip out "Query failed: "
            if (strData.indexOf('Query failed: ') === 0) {
                strData = strData.substring('Query failed: '.length);
            }

            // save error text in case we dont find any error part labels
            jsnRet.error_text = strData;

            // trim and split on return for parsing
            arrLines = strData.trim().split('\n');

            for (i = 0, len = arrLines.length; i < len; i += 1) {
                arrLine = arrLines[i].split('\t');

                jsnRet[arrLine[0]] = WS.decodeFromTabDelimited(arrLine[1] || '');
            }
        }

        // get error title and error hint
        if (event.code === 1001) {
            jsnRet.error_title = 'Going Away';
            jsnRet.error_hint = 'The server or client closed the connection because of server shutdown or navigating away from the page.';

        } else if (event.code === 1002) {
            jsnRet.error_title = 'Protocol';
            jsnRet.error_hint = 'The connection was closed because of error related to the protocol used.';

        } else if (event.code === 1003) {
            jsnRet.error_title = 'Unsupported Data';
            jsnRet.error_hint = 'The connection was closed because the data that was received was not it a supported format.';

        } else if (event.code === 1005) {
            jsnRet.error_title = 'No Status Received';
            jsnRet.error_hint = 'The connection was closed because it received an empty status.';

        } else if (event.code === 1006) {
            jsnRet.error_title = 'Abnormal Closure';
            jsnRet.error_hint = 'The connection was closed because of abnormal circumstances.';

        } else if (event.code === 1007) {
            jsnRet.error_title = 'Invalid Payload Data';
            jsnRet.error_hint = 'The connection was closed because the payload type did not match the defined message type.';

        } else if (event.code === 1008) {
            jsnRet.error_title = 'Policy Violation';
            jsnRet.error_hint = 'The connection was closed because policy governing this connection was violated.';

        } else if (event.code === 1009) {
            jsnRet.error_title = 'Message Too Big';
            jsnRet.error_hint = 'The connection was closed because the message was too long for it to proccess.';

        } else if (event.code === 1010) {
            jsnRet.error_title = 'Mandatory Extension';
            jsnRet.error_hint = 'The client closed the connection because the server was supposed to negotiate extension(s) but it did not.';

        } else if (event.code === 1011) {
            jsnRet.error_title = 'Internal Server';
            jsnRet.error_hint = 'The server closed the connection because it could not fulfill the request.';

        } else if (event.code === 1015) {
            jsnRet.error_title = 'TLS handshake';
            jsnRet.error_hint = 'The connection was closed because the handshake failed.';
        }

        //console.log(jsnRet);

        return jsnRet;
    }

    function cleanErrorValue(strValue) {
        strValue = strValue || '';

        if (strValue.indexOf('DB_exec failed:') !== -1) {
            strValue = strValue.replace(/[.\s\S]*DB_exec\ failed:/mi, '');
        }

        if (strValue.indexOf('Query failed:') !== -1) {
            strValue = strValue.replace(/[.\s\S]*Query\ failed:/mi, '');
        }

        if (strValue.indexOf('FATAL') !== -1) {
            strValue = strValue.replace(/[.\s\S]*FATAL/mi, '');
        }

        strValue = strValue
                        .replace(/\\n/gi, '\n')
                        .replace(/\\t/gi, '\t')
                        .replace(/\[.*\]/gi, '')
                        .replace(/\([0-9]*\)/gi, '');

        return WS.trim(strValue.trim(), '"');
    }

    function errorJSONToHTML(errorJSON) {
        return '<pre style="word-break: break-all; white-space: pre-wrap;">' +
                    (errorJSON.error_title ?
                        'There was ' +
                            (
                                ['A', 'E', 'I', 'O', 'U']
                                    .indexOf(errorJSON.error_title[0].toUpperCase()) === -1
                                        ? 'a'
                                        : 'an'
                            ) +
                            ' "' + encodeHTML(errorJSON.error_title) + '" error:' :
                        'There was an error:') +
                        (
                            !errorJSON.error_hint &&
                            !errorJSON.error_query &&
                            !errorJSON.error_context &&
                            !errorJSON.error_notice
                                ? '<br /><br />' + encodeHTML(errorJSON.error_text)
                                : ''
                        ) +
                        (errorJSON.error_hint ? '<br /><br />HINT: ' + encodeHTML(errorJSON.error_hint) : '') +
                      //(errorJSON.error_detail   ? '<br /><br />DETAIL: ' + encodeHTML(errorJSON.error_detail) : '') +
                        (errorJSON.error_query ? '<br /><br />QUERY: ' + encodeHTML(errorJSON.error_query) : '') +
                        (errorJSON.error_position ? '<br /><br />ERROR POSITION: ' + encodeHTML(errorJSON.error_position) : '') +
                        (errorJSON.error_context ? '<br /><br />CONTEXT: ' + encodeHTML(errorJSON.error_context) : '') +
                        (errorJSON.error_notice ? '<br /><br /><br />' + encodeHTML(errorJSON.error_notice) : '') +
                '</pre>';
    }

    WS.webSocketErrorDialog = function (jsnError, tryAgainCallback, cancelCallback) {
        var templateElement = document.createElement('template'), strHTML, jsnErrorClean;

        jsnErrorClean = {};

        jsnErrorClean.error_text = cleanErrorValue(jsnError.error_text);
        jsnErrorClean.error_hint = cleanErrorValue(jsnError.error_hint);
        jsnErrorClean.error_detail = cleanErrorValue(jsnError.error_detail);
        jsnErrorClean.error_query = cleanErrorValue(jsnError.error_query);
        jsnErrorClean.error_position = cleanErrorValue(jsnError.error_position);
        jsnErrorClean.error_context = cleanErrorValue(jsnError.error_context);
        jsnErrorClean.error_notice = cleanErrorValue(jsnError.error_notice);

        templateElement.setAttribute('data-theme', 'error');
        strHTML = ml(function () {/*
            <gs-page>
                <gs-header><center><h3>There was an error!</h3></center></gs-header>
                <gs-body padded>
                    {{HTML}}
                    <br />
                    <gs-button class="error-button-show-full-text">Show Full Error Text</gs-button>
                </gs-body>
                <gs-footer>{{BUTTONS}}</gs-footer>
            </gs-page>
        */
        });

        var openFunction = function () {
            xtag.query(this, '.error-button-show-full-text')[0].addEventListener('click', function () {
                var templateElement = document.createElement('template');

                templateElement.innerHTML = ml(function () {/*
                    <gs-page>
                        <gs-header><center><h3>Full Error Text</h3></center></gs-header>
                        <gs-body padded>
                            {{HTML}}
                        </gs-body>
                        <gs-footer><gs-button dialogclose>Done</gs-button></gs-footer>
                    </gs-page>
                */
                });

                WS.openDialog(templateElement);
            });
        };

        if (typeof tryAgainCallback === 'function') {
            templateElement.innerHTML =
                strHTML.replace(
                    '{{BUTTONS}}',
                    '<gs-grid>' +
                    '    <gs-block><gs-button dialogclose>Cancel</gs-button></gs-block>' +
                    '    <gs-block><gs-button dialogclose listen-for-return>Try Again</gs-button></gs-block>' +
                    '</gs-grid>'
                );

            WS.openDialog(templateElement, openFunction, function (event, strAnswer) {
                if (strAnswer === 'Try Again') {
                    tryAgainCallback(strAnswer);
                } else {
                    if (typeof cancelCallback === 'function') {
                        cancelCallback(strAnswer);
                    }
                }
            });

        } else {
            templateElement.innerHTML = strHTML.replace('{{BUTTONS}}', '<gs-button dialogclose listen-for-return>Ok</gs-button>');
            WS.openDialog(templateElement, openFunction);
        }
    };

    var sequence = 0, jsnMessages = {}, arrWaitingCalls = [];
    WS.openSocket = function (strLink, socketKey, relinkSessionID, relinkSessionNotifications) {
        var strLoc = window.location.toString();
        var socket = new WebSocket(
                            (window.location.protocol.toLowerCase().indexOf('https') === 0 ? 'wss' : 'ws') +
                            '://' + (window.location.host || window.location.hostname) + '/' + strLink +
                            (relinkSessionID ? '?sessionid=' + relinkSessionID : ''));

        if (relinkSessionID) {
            socket.WSSessionID = relinkSessionID;
            socket.oldSessionID = relinkSessionID;
        }
        if (relinkSessionNotifications) {
            socket.notifications = relinkSessionNotifications;
        } else {
            socket.notifications = [];
        }
        socket.onmessage = function (event) {
            var message = event.data, messageID, responseNumber, key, strError, arrLines, i, len, jsnMessage, startFrom;

            if (typeof (message) === 'object') {
                //window.binaryTestTEST = message;
                //console.log(message);
                var buf = message;
                message = String.fromCharCode.apply(null, new Uint8Array(buf));
                //console.log(buf);
                //console.log(message);
            }

            // if sessionid
            if (message.indexOf('sessionid = ') === 0) {
                socket.WSSessionID = message.substring('sessionid = '.length, message.indexOf('\n'));

                for (key in jsnMessages) {
                    jsnMessage = jsnMessages[key];

                    if ((
                            jsnMessage.session === socket.WSSessionID ||
                            jsnMessage.session === socket.oldSessionID
                        ) && jsnMessage.bolFinished === false) {

                        jsnMessage.session = socket.WSSessionID;

                        startFrom = 1;
                        for (i = 0, len = jsnMessage.arrResponseNumbers.length; i < len; i += 1) {
                            // if there is a difference between the current response number and the
                            //      startFrom: stop looping because startFrom now holds the number that we want
                            if (startFrom !== jsnMessage.arrResponseNumbers[i]) {
                                break;
                            }
                            startFrom += 1;
                        }

                        WS.requestFromSocket(socket, key, 'SEND FROM\t' + startFrom, '', jsnMessage.id);
                    }
                }

                for (i = 0, len = arrWaitingCalls.length; i < len; i += 1) {
                    arrWaitingCalls[0]();
                    arrWaitingCalls.splice(0, 1);
                }

                // else
            } else {
                messageID = message.substring('messageid = '.length, message.indexOf('\n'));
                message = message.substring(message.indexOf('\n') + 1);

                jsnMessage = jsnMessages[messageID];

                // if there is a message entry for this message ID
                if (jsnMessage) {
                    arrLines = message.split('\n');

                    // if there is no response number: assume this is the last message and mark the message as finished
                    if (message.indexOf('responsenumber = ') === -1 ||
                        (
                            message.indexOf('responsenumber = ') === 0 &&
                            (
                                arrLines[1] === 'TRANSACTION COMPLETED' ||
                                arrLines[2] === 'OK'
                            )
                        )) {
                        jsnMessage.bolFinished = true;
                    }

                    // if there is a response number
                    if (message.indexOf('responsenumber = ') === 0) {
                        // get message number
                        responseNumber = message.substring('responsenumber = '.length, message.indexOf('\n'));
                        message = message.substring(message.indexOf('\n') + 1);

                        // append message number and message content to arrays
                        jsnMessage.arrResponseNumbers.push(parseInt(responseNumber, 10));
                        jsnMessage.arrResponses.push(message);

                        // send confirm signal
                        WS.requestFromSocket(socket, key, 'CONFIRM\t' + responseNumber, '', messageID);
                    }

                    // ERROR CHECK
                    arrLines = message.split('\n');

                    // if there is a transactionid: look at the second line
                    if (arrLines[0].indexOf('transactionid') === 0 && arrLines[1] === 'FATAL') {
                        strError = 'error';
                        message = message.substring(message.indexOf('\n') + 1);
                        message = message.substring(message.indexOf('\n') + 1);
                        message = arrLines[0] + '\n' + message;

                        // else: check the first line
                    } else if (arrLines[0] === 'FATAL') {
                        strError = 'error';
                        message = message.substring(message.indexOf('\n') + 1);
                    }

                    // if transaction complete: clear message arrays and mark as finised
                    if (message === 'TRANSACTION COMPLETED') { // || message === 'EMPTY\n\\.'
                        jsnMessage.arrResponseNumbers = [];
                        jsnMessage.arrResponses = [];
                        jsnMessage.bolFinished = true;
                    }

                    // if there was a FATAL: mark as finished and apply callback
                    if (strError) {
                        jsnMessage.bolFinished = true;
                        jsnMessage.callback.apply(null, [message, strError, webSocketNormalizeError(event)]);

                        // else: call callback with message
                    } else {
                        jsnMessage.callback.apply(null, [message]);
                    }

                    // else if the messageID is 'NULL': notification from the server
                } else if (messageID === 'NULL') {
                    socket.notifications.push(message);
                    //GS.triggerEvent(window, 'notification', { 'socket': socket, 'message': message });
                }
            }
        };

        socket.onopen = function (event) {

        };

        socket.onerror = function (event) {
            var i, len;

            console.log('SOCKET ERROR', event);
            socket.bolError = true;
            //socket.stayClosed = true;

            //for (i = 0, len = arrWaitingCalls.length; i < len; i += 1) {
            //    arrWaitingCalls[0]();
            //    arrWaitingCalls.splice(0, 1);
            //}
        };

        socket.onclose = function (event) {
            //console.log('SOCKET CLOSING', socket.stayClosed, socket.bolError, event);

            // error closure dialog
            if (socket.bolError && arrWaitingCalls.length > 0) {
                // abnormal closure
                if (event.code === 1006) {
                    webSocketConnectionErrorDialog(socket, 'The connection to the database has been closed. We cannot display the reasons for this closure because the browser does not give us access to those details, please check the server logs for the error details.');

                    // protocol error
                } else if (event.code === 1002) {
                    webSocketConnectionErrorDialog(socket, 'The connection to the database has been closed. Either the server or the browser has closed the connection because of a Websocket Protocol error.');

                    // type error
                } else if (event.code === 1003) {
                    webSocketConnectionErrorDialog(socket, 'The connection to the database has been closed. Either the server or the browser has closed the connection because of it was sent a data type it could not understand.');
                } else {
                    webSocketConnectionErrorDialog(socket, 'The connection to the database has been closed. The cause of this is unknown.');
                }
            }

            if (!socket.stayClosed) {
                setTimeout(function () {
                    //console.log('ATTEMPTING SOCKET RE-OPEN', socket);
                    var key = socketKey;
                    $.tests[key].socket = WS.openSocket(key, key, $.tests[key].socket.WSSessionID, $.tests[key].socket.notifications);
                }, 1000);
            } else {
                if (socket.bolError) {
                    //console.log('SOCKET NOT RE-OPENING DUE TO ERROR');
                } else {
                    //console.log('SOCKET NOT RE-OPENING DUE TO MANUAL CLOSE');
                }
            }
        };

        return socket;
    };

    WS.requestFromSocket = function (socket, key, strMessage, callback, forceMessageID) {
        var oldOnOpen, messageID;

        if (!socket || socket.readyState === socket.CLOSED) {
            if (!$.tests[key].socket || $.tests[key].socket.readyState === socket.CLOSED) {
                //console.trace('ATTEMPTING SOCKET RE-OPEN 2');
                $.tests[key].socket = WS.openSocket(key, key);
            }
            socket = $.tests[key].socket;
        }

        // if the socket is open: register callback and send request
        if (socket.readyState === socket.OPEN && socket.WSSessionID) {

            if (!forceMessageID) {
                sequence += 1;
                messageID = socket.WSSessionID + '_' + sequence;
                jsnMessages[messageID] = {
                    'id': messageID,
                    'session': socket.WSSessionID,
                    'callback': callback,
                    'arrResponseNumbers': [],
                    'arrResponses': [],
                    'bolFinished': false
                };

            } else {
                messageID = forceMessageID;
            }

            if (typeof (strMessage) === 'object') {
                jsnMessages[messageID].parameters = new Blob(['messageid = ' + messageID + '\n', strMessage], { type: 'application/x-binary' });
            } else {
                jsnMessages[messageID].parameters = 'messageid = ' + messageID + '\n' + strMessage;
            }
            socket.send(jsnMessages[messageID].parameters);
            //console.log('SOCKET MESSAGE SENT                   ', 'messageid = ' + sequence);// + '\n' + strMessage);

            return messageID;

            // if the socket is connecting: bind socket onopen to call this funtion again
        } else if (socket.readyState === socket.CONNECTING || socket.readyState === socket.OPEN) {
            //console.log('SOCKET REQUEST WHILE CONNECTING       ');

            arrWaitingCalls.push(function () {
                WS.requestFromSocket(socket, key, strMessage, callback, forceMessageID);
            });

            // if the socket is closed: error
        } else if (socket.readyState === socket.CLOSED) {
            //console.log('SOCKET REQUEST WHILE CLOSED           ');
            callback.apply(null, ['Socket Is Closed', 'error', webSocketNormalizeError({ 'reason': 'Socket Is Closed' })]);

            // if the socket is closing: error
        } else if (socket.readyState === socket.CLOSING) {
            //console.log('SOCKET REQUEST WHILE CLOSING          ');
            callback.apply(null, ['Socket Is Closing', 'error', webSocketNormalizeError({ 'reason': 'Socket Is Closing' })]);
        }
    };

    WS.rebootSocket = function (socket) {
        socket.stayClosed = false;
        socket.close();
    };

    WS.closeSocket = function (socket) {
        socket.stayClosed = true;
        socket.close();
    };
})();


// WS.encodeForTabDelimited('asdf\\asdf\\asdf\r\nasdf\r\nasdf\tasdf\tasdf')
WS.encodeForTabDelimited = function (strValue, nullValue) {
    'use strict';
    strValue = String(strValue || '');

    if (strValue === '\\N') {
        return strValue;
    } else {
        strValue = strValue.replace(/\\/g, '\\\\') // double up backslashes
                        .replace(/\n/g, '\\n')     // replace newline with the text representation '\n'
                        .replace(/\r/g, '\\r')     // replace carriage return with the text representation '\r'
                        .replace(/\t/g, '\\t');    // replace tab with the text representation '\t'

        if (strValue === nullValue) {
            strValue = '\\N';
        }

        return strValue;
    }
};

// WS.decodeFromTabDelimited('asdf\\\\asdf\\\\asdf\\r\\nasdf\\r\\nasdf\\tasdf\\tasdf')
WS.decodeFromTabDelimited = function (strValue, nullValue) {
    'use strict';
    var i, len, strRet = '';

    if (nullValue === undefined) {
        nullValue = '\\N';
    }

    for (i = 0, len = strValue.length; i < len; i += 1) {
        if (strValue[i] === '\\' && strValue[i + 1]) {
            i += 1;

            if (strValue[i] === 'n') {
                strRet += '\n';

            } else if (strValue[i] === 'r') {
                strRet += '\r';

            } else if (strValue[i] === 't') {
                strRet += '\t';

            } else if (strValue[i] === 'N') {
                strRet += nullValue;

            } else if (strValue[i] === '\\') {
                strRet += '\\';

            } else {
                strRet += '\\' + strValue[i];
            }

        } else {
            strRet += strValue[i];
        }
    }

    return strRet;

    //return strValue.replace(/\\\\/g, '\\')
    //               .replace(/\\n/g, '\n')
    //               .replace(/\\r/g, '\r')
    //               .replace(/\\t/g, '\t')
    //               .replace(/\\N/g, 'NULL');
};
