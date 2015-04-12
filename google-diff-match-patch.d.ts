declare class diff_match_patch {
    diff_main(left: string, right: string): Array<IDiff>;
    diff_cleanupSemantic(diff: Array<IDiff>);
}

interface IDiff {
    0: number; // op
    1: string; // text
}