// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Messenger {
    struct MessageInfo {
        address sender;
        string ipfsHash;
        uint256 timestamp;
        bool isFile;
        MessageStatus status;
    }

    struct Contact {
        string name;
        string publicKey;
        bool blocked;
        uint256 lastSeen;
    }

    struct Reaction {
        address reactor;
        string emoji;
        uint256 timestamp;
    }

    enum MessageStatus { SENT, DELIVERED, READ }

    // Mapping from user address to their contacts
    mapping(address => mapping(address => Contact)) private contacts;
    
    // Mapping from conversation ID to messages
    mapping(bytes32 => MessageInfo[]) private conversations;
    
    // Mapping from message ID to reactions
    mapping(bytes32 => mapping(uint256 => Reaction[])) private messageReactions;
    
    // Mapping from user to their public key
    mapping(address => string) private publicKeys;

    // Events
    event MessageSent(
        bytes32 indexed conversationId,
        address indexed sender,
        address indexed recipient,
        string ipfsHash,
        uint256 timestamp,
        bool isFile
    );

    event MessageStatusUpdated(
        bytes32 indexed conversationId,
        uint256 indexed messageIndex,
        MessageStatus status
    );

    event ContactUpdated(
        address indexed owner,
        address indexed contact,
        string name,
        bool blocked
    );

    event ReactionAdded(
        bytes32 indexed conversationId,
        uint256 indexed messageIndex,
        address indexed reactor,
        string emoji
    );

    // Set or update user's public key
    function setPublicKey(string memory publicKey) public {
        require(bytes(publicKey).length > 0, "Invalid public key");
        publicKeys[msg.sender] = publicKey;
    }

    // Add or update contact
    function updateContact(address contactAddress, string memory name, string memory publicKey, bool blocked) public {
        require(contactAddress != address(0), "Invalid contact address");
        contacts[msg.sender][contactAddress] = Contact({
            name: name,
            publicKey: publicKey,
            blocked: blocked,
            lastSeen: block.timestamp
        });
        emit ContactUpdated(msg.sender, contactAddress, name, blocked);
    }

    function sendMessage(address to, string memory ipfsHash, bool isFile) public {
        require(to != address(0), "Invalid recipient address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!contacts[to][msg.sender].blocked, "You have been blocked by the recipient");

        bytes32 conversationId = getConversationId(msg.sender, to);
        
        MessageInfo memory newMessage = MessageInfo({
            sender: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isFile: isFile,
            status: MessageStatus.SENT
        });
        
        conversations[conversationId].push(newMessage);
        
        emit MessageSent(
            conversationId,
            msg.sender,
            to,
            ipfsHash,
            block.timestamp,
            isFile
        );
    }

    function updateMessageStatus(
        address participant,
        uint256 messageIndex,
        MessageStatus status
    ) public {
        bytes32 conversationId = getConversationId(msg.sender, participant);
        require(messageIndex < conversations[conversationId].length, "Invalid message index");
        
        MessageInfo storage message = conversations[conversationId][messageIndex];
        require(msg.sender == participant, "Only recipient can update status");
        
        message.status = status;
        emit MessageStatusUpdated(conversationId, messageIndex, status);
    }

    function addReaction(
        address participant,
        uint256 messageIndex,
        string memory emoji
    ) public {
        bytes32 conversationId = getConversationId(msg.sender, participant);
        require(messageIndex < conversations[conversationId].length, "Invalid message index");
        
        Reaction memory reaction = Reaction({
            reactor: msg.sender,
            emoji: emoji,
            timestamp: block.timestamp
        });
        
        messageReactions[conversationId][messageIndex].push(reaction);
        emit ReactionAdded(conversationId, messageIndex, msg.sender, emoji);
    }

    function getMessages(address participant1, address participant2) 
        public 
        view 
        returns (MessageInfo[] memory) 
    {
        bytes32 conversationId = getConversationId(participant1, participant2);
        return conversations[conversationId];
    }

    function getMessageReactions(bytes32 conversationId, uint256 messageIndex)
        public
        view
        returns (Reaction[] memory)
    {
        return messageReactions[conversationId][messageIndex];
    }

    function getContact(address owner, address contactAddress)
        public
        view
        returns (Contact memory)
    {
        return contacts[owner][contactAddress];
    }

    function getPublicKey(address user) public view returns (string memory) {
        return publicKeys[user];
    }

    function getConversationId(address participant1, address participant2) 
        internal 
        pure 
        returns (bytes32) 
    {
        if (participant1 < participant2) {
            return keccak256(abi.encodePacked(participant1, participant2));
        }
        return keccak256(abi.encodePacked(participant2, participant1));
    }
} 