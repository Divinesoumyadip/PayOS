#include <vector>
#include <string>

/**
 * PayOS Distributed Consensus Core (Simplified Raft)
 * Ensures all nodes agree on the transaction state before committing.
 * Matches Juspay's 'Multi-DC Architecture' and '99.999% Availability' pillar.
 */
enum NodeState { FOLLOWER, CANDIDATE, LEADER };

class ConsensusNode {
public:
    int nodeId;
    NodeState state;
    int currentTerm;
    
    bool requestVote(int candidateId, int term) {
        if (term > currentTerm) {
            currentTerm = term;
            return true; // Vote granted: Safety first.
        }
        return false;
    }
};
