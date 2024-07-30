import React, { useEffect, useState } from 'react';
import { FaDonate } from 'react-icons/fa';
import { Modal, ModalHeader, ModalBody, Row, Button } from 'reactstrap';
import './Projects.css';

const Projects = ({ state }) => {
    const [modal, setModal] = useState(false);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            const { contract } = state;
            if (contract) {
                try {
                    const projects = await contract.methods.allProjects().call();
                    setProjects(projects);
                } catch (error) {
                    console.error("Error fetching projects:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProjects();
    }, [state]);

    const donateEth = async (event) => {
        event.preventDefault();
        const ethInput = document.querySelector("#eth");
        const eth = ethInput.value;

        if (!eth || isNaN(eth) || parseFloat(eth) <= 0) {
            alert("Please enter a valid amount of ETH");
            return;
        }

        try {
            const { contract, web3 } = state;
            const weiValue = web3.utils.toWei(eth, "ether");
            const accounts = await web3.eth.getAccounts();
            await contract.methods.donate().send({ from: accounts[0], value: weiValue, gas: 480000 });
            alert("Transaction Successful");
            ethInput.value = "";  // Clear the input field
        } catch (error) {
            alert("Transaction Not Successful");
            console.error("Donation error:", error);
        }
    };

    return (
        <section className="project-section">
            <h1 className="title">Projects</h1>
            {loading ? (
                <p>Loading projects...</p>
            ) : (
                <div className="card-wrapper">
                    {projects.length > 0 ? projects.map((project, index) => {
                        const githubLink = `https://github.com/ME-AND-CODE/${project.githubLink}`;
                        return (
                            <a href={githubLink} className="project-card" target="_blank" rel="noopener noreferrer" key={index}>
                                <div className="card-img">
                                    <img src={`https://gateway.pinata.cloud/ipfs/${project.image}`} alt={project.name} />
                                </div>
                                <div className="card-text">
                                    <h3>{project.name}</h3>
                                    <p>{project.description}</p>
                                </div>
                            </a>
                        );
                    }) : (
                        <p>No projects available.</p>
                    )}
                </div>
            )}

            {/* Modal for ETH Donation */}
            <Modal size="md" isOpen={modal} toggle={() => setModal(!modal)}>
                <ModalHeader toggle={() => setModal(!modal)}>
                    Enter the ETH you want to donate!
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={donateEth}>
                        <Row>
                            <input id="eth" type="number" step="0.01" min="0" className="form-control" placeholder="Enter ETH amount" />
                            <Button className="mt-4" color="primary" type="submit">
                                Send
                            </Button>
                        </Row>
                    </form>
                </ModalBody>
            </Modal>

            <p className="donate" onClick={() => setModal(true)}>
                Liked the projects? Consider donating ETH <FaDonate className="icon" />
            </p>
        </section>
    );
};

export default Projects;
